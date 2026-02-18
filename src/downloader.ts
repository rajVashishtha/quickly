import fs from "fs";
import { splitIntoChunks } from "./utils.js";
import { downloadSingleFile, downloadChunk } from "./chunks.js";
import { request } from "undici";
import chalk from "chalk";
import { ProgressTracker } from "./progress.js";
import { Logger } from "./logger.js";
import { runPool } from "./runPool.js";
import { v4 as uuidv4 } from 'uuid';


async function getFileInfo(url: string) {
  console.log(chalk.blue("🔍 Checking file..."));

  try {
    const { statusCode, headers } = await request(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      headersTimeout: 10000,
      bodyTimeout: 10000
    });

    if (statusCode === 200) {
      const size = Number(headers["content-length"]);
      if (!size) throw new Error("Missing content-length");
      return { size, supportsRange: false };
    }

    if (statusCode === 206) {
      const contentRange = headers["content-range"] as string;
      const size = Number(contentRange.split("/")[1]);
      return { size, supportsRange: true };
    }

    throw new Error(`Unexpected response ${statusCode}`);

  } catch (err: any) {
    throw new Error(`Network error: ${err.message}`);
  }
}

function cleanupFiles(parts: string[]) {
  for (const file of parts) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

async function mergeFiles(parts: string[], output: string) {
  const writeStream = fs.createWriteStream(output);

  for (const part of parts) {
    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(part);
      readStream.pipe(writeStream, { end: false });
      readStream.on("end", () => {
        fs.unlinkSync(part);
        resolve();
      });
      readStream.on("error", reject);
    });
  }

  writeStream.end();
}

export async function startDownload(
  url: string,
  output: string,
  retries: number,
  logger: Logger,
  maxConnections: number
) {
  const { size, supportsRange } = await getFileInfo(url);
  const id = uuidv4();

  console.log(`📦 File size: ${(size / 1024 / 1024).toFixed(2)} MB`);
  const tracker = new ProgressTracker(size);

  if (!supportsRange) {
    logger.warn("⚠ Server does NOT support range requests");
    logger.info("Falling back to single connection download...");
    await downloadSingleFile(url, output, (n)=>tracker.addBytes(n));
    tracker.finish();
    console.log(chalk.green("🎉 Download complete:"), output);
    return;
  }

  const chunks = splitIntoChunks(size);
  console.log(chalk.gray(`\nRange supported — creating ${chunks.length} chunks`));
  console.log(chalk.gray(`\n Creating ${maxConnections} connections at once`));

  const downloadedParts: string[] = [];

  try {
    const tasks = chunks.map(chunk => () =>
      downloadChunk(id, url, chunk, retries, (n)=>tracker.addBytes(n), logger)
    );
    const parts = await runPool(tasks, maxConnections);
    logger.info("🔗 Merging chunks...");
    await mergeFiles(parts, output);
    tracker.finish();
    logger.success("🎉 Download complete:");
  } catch (err) {
    console.error(chalk.red("❌ Download failed:"), (err as Error).message);
    cleanupFiles(downloadedParts);
    throw err;
  }
}

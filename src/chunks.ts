import { request } from "undici";
import fs from "fs";
import { Chunk } from "./types.js";
import chalk from "chalk";
import cliProgress from "cli-progress";
import { Logger } from "./logger.js";
import prettyBytes from "pretty-bytes";

let totalDownloaded = 0;
let totalSize = 0;
let progressBar: cliProgress.SingleBar | null;
let startTime: number;

export function initProgress(size: number) {
  totalSize = size;
  totalDownloaded = 0;
  startTime = Date.now();

  progressBar = new cliProgress.SingleBar({
    format:
      chalk.cyan("{bar}") +
      " {percentage}% | {value}/{total} MB | {speed} MB/s",
    hideCursor: true
  });

  progressBar.start(size, 0, { speed: "0.00" });
}

export function finishProgress() {
  if (progressBar) {
    progressBar.stop();
    progressBar = null;
  }
}

async function streamToFile(body: any, file: string, onData: (n:number)=>void) {
  const writer = fs.createWriteStream(file);

  body.on("data", (chunk: Buffer) => {
    onData(chunk.length); // 👈 report to manager
  });

  await new Promise<void>((resolve, reject) => {
    body.pipe(writer);
    body.on("error", reject);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export async function downloadChunk(
  id: string,
  url: string,
  chunk: Chunk,
  retries: number,
  onProgress: (n:number)=>void,
  logger: Logger
): Promise<string> {

  const partFile = `${id}-part-${chunk.index}`;
  const startTime = Date.now();
  const chunkStart = prettyBytes(chunk.start);
  const chunkEnd = prettyBytes(chunk.end);

  logger.debug(`Chunk ${chunk.index} → starting (${chunkStart}-${chunkEnd})`);

  let downloadedAlready = 0;
  if (fs.existsSync(partFile)) {
    downloadedAlready = fs.statSync(partFile).size;
    logger.debug(`Chunk ${chunk.index} resuming from ${downloadedAlready} bytes`);
  }

  const start = chunk.start + downloadedAlready;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { statusCode, body } = await request(url, {
        method: "GET",
        headers: { Range: `bytes=${start}-${chunk.end}` },
      });

      if (statusCode !== 206) throw new Error("Range not honored");

      await streamToFile(body, partFile, onProgress);

      const seconds = (Date.now() - startTime) / 1000;
      logger.debug(`✅ Chunk ${chunk.index} finished in ${seconds.toFixed(2)}s`);

      return partFile;

    } catch (err) {
      logger.warn(`⚠ Chunk ${chunk.index} failed (attempt ${attempt}/${retries})`);

      if (attempt === retries) {
        logger.error(`❌ Chunk ${chunk.index} permanently failed`);
        throw err;
      }
    }
  }

  throw new Error("Chunk failed");
}

export async function downloadSingleFile(url: string, output: string, onProgress: (n:number)=>void) {
  const { body } = await request(url, {
    method: "GET",
    headersTimeout: 10000,
    bodyTimeout: 30000
  });

  await streamToFile(body, output, onProgress);
}

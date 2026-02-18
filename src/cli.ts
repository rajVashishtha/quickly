#!/usr/bin/env node
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { Command } from "commander";
import { startDownload } from "./downloader.js";
import path from "path";
import { Logger } from "./logger.js";

const program = new Command();

program
  .name("quickly")
  .description("⚡ Multi-connection downloader")
  .argument("<url>", "File URL")
  .argument("[output]", "Output filename", "download.bin")
  .option("-r, --retries <number>", "Retries per chunk", "3")
  .option("-c, --connections <number>", "Max connections to run in parallel", "5")
  .option("-v, --verbose", "Show detailed logs")
  .action(async (url, output, options) => {
    const retries = Number(options.retries) || 3;
    const connections = Number(options.connections) || 5;
    const logger = new Logger(options.verbose);
    if (!output) {
      const urlObj = new URL(url);
      output = path.basename(urlObj.pathname);
      if (!output) output = "download";
    }

    try {
      await startDownload(url, output, retries, logger, connections);
    } catch (err: any) {
      console.error("\nDownload failed");
      console.error("Reason:", err?.message || err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);

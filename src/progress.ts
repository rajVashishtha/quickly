import prettyBytes from "pretty-bytes";
import cliProgress from "cli-progress";

export class ProgressTracker {
  private downloaded = 0;
  private startTime = Date.now();
  private bar;

  constructor(private totalSize: number) {
    this.bar = new cliProgress.SingleBar({
      format:
        "⬇️ {bar} {percentage}% | {downloaded}/{total} | {speed}/s | ETA {eta}s",
    }, cliProgress.Presets.shades_classic);

    this.bar.start(totalSize, 0, {
      downloaded: "0B",
      total: prettyBytes(totalSize),
      speed: "0B",
      eta: "∞",
    });
  }

  addBytes(bytes: number) {
    this.downloaded += bytes;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = this.downloaded / elapsed;
    const eta = (this.totalSize - this.downloaded) / speed;

    this.bar.update(this.downloaded, {
      downloaded: prettyBytes(this.downloaded),
      // total: prettyBytes(this.totalSize),
      speed: prettyBytes(speed),
      eta: isFinite(eta) ? eta.toFixed(0) : "∞",
    });
  }

  finish() {
    this.bar.stop();
  }
}

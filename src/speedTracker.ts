export class SpeedTracker {
  private startTime = Date.now();
  private downloaded = 0;

  addBytes(bytes: number) {
    this.downloaded += bytes;
  }

  getSpeed(): number {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return this.downloaded / elapsed; // bytes/sec
  }

  getETA(totalBytes: number): number {
    const remaining = totalBytes - this.downloaded;
    const speed = this.getSpeed();
    if (speed === 0) return Infinity;
    return remaining / speed; // seconds
  }
}

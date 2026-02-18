const MB = 1024 * 1024;
const MAX_CHUNK_SIZE = 100 * MB;

export function calculateConnections(size: number): number {
  const connections = Math.ceil(size / MAX_CHUNK_SIZE);
  return connections;
}

export function splitIntoChunks(size: number): { start: number; end: number; index: number }[] {
  const chunks = [];
  let index = 0;

  for (let start = 0; start < size; start += MAX_CHUNK_SIZE) {
    const end = Math.min(start + MAX_CHUNK_SIZE - 1, size - 1);
    chunks.push({ start, end, index });
    index++;
  }

  return chunks;
}

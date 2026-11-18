import { copyFile, mkdir, rm } from 'node:fs/promises';

const overview = new URL('../site/', import.meta.url);
const output = new URL('../build/', import.meta.url);

// Stage only the two public files in the Sites overview directory.
await rm(output, { recursive: true, force: true });
try {
  await mkdir(output);
  for (const file of ['index.html', 'styles.css']) {
    await copyFile(new URL(file, overview), new URL(file, output));
  }
} catch (error) {
  await rm(output, { recursive: true, force: true });
  throw error;
}

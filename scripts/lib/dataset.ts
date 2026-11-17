/**
 * Reads the editorial JSON from disk for the command-line checks.
 *
 * Shared by `check:data` and the strict release gate so both read exactly the
 * same files the application bundles. Nothing here is used by the browser.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RawDataset {
  works: unknown[];
  objects: unknown[];
  places: unknown[];
  sources: unknown[];
  media: unknown[];
}

export function readJson(root: string, relativePath: string): unknown {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
}

function readRecordDirectory(root: string, relativeDir: string): unknown[] {
  return readdirSync(join(root, relativeDir))
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => readJson(root, join(relativeDir, file)));
}

function readCollection(root: string, relativePath: string): unknown[] {
  const parsed = readJson(root, relativePath);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as { items?: unknown }).items)
  ) {
    throw new Error(`${relativePath} must contain an "items" array.`);
  }
  return (parsed as { items: unknown[] }).items;
}

export function loadDatasetFromDisk(root: string = process.cwd()): RawDataset {
  return {
    works: readRecordDirectory(root, 'data/works'),
    objects: readRecordDirectory(root, 'data/objects'),
    places: readCollection(root, 'data/places.json'),
    sources: readCollection(root, 'data/sources.json'),
    media: readCollection(root, 'data/media.json'),
  };
}

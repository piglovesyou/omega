import { promises as fsPromises } from 'fs';
import { createReadStream, existsSync } from 'fs';
import _rimraf from 'rimraf';
import { promisify } from 'util';

export const rimraf = promisify(_rimraf);

export const { writeFile } = fsPromises;
export { readFileSync, statSync } from 'fs';

export function readFile(path: string): Promise<string> {
  return fsPromises.readFile(path, 'utf-8');
}

const leadingStringOfGeneratedContent = '/* ';
const hexHashLength = 40;

export function withHash(sourceHash: string, content: string): string {
  return `${leadingStringOfGeneratedContent}${sourceHash}
 * This file is automatically generated by omega. */

${content}`;
}

export function readHash(filePath: string): Promise<string | null> {
  if (!existsSync(filePath)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, {
      encoding: 'utf-8',
      highWaterMark: leadingStringOfGeneratedContent.length + hexHashLength,
    });
    stream.on('error', (error) => reject(error));
    stream.on('data', (chunk: string) => {
      const hash = chunk.slice(leadingStringOfGeneratedContent.length);
      if (hash.length !== hexHashLength) return resolve(null);

      resolve(hash);
    });
    stream.read();
  });
}

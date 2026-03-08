import { createReadStream, createWriteStream } from 'fs';
import { access, mkdir } from 'fs/promises';
import { createBrotliDecompress } from 'zlib';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API

	const workspacePath = join(import.meta.dirname, 'workspace');
	const compressedPath = join(workspacePath, 'compressed');
	const archivePath = join(compressedPath, 'archive.br');
	const destPath = join(workspacePath, 'decompressed');

	try {
		await access(compressedPath);
	} catch {
		throw new Error('FS operation failed');
	}

	try {
		await access(archivePath);
	} catch {
		throw new Error('FS operation failed');
	}

	await mkdir(destPath, { recursive: true });

	// Parse the custom binary format from the decompressed stream
	await new Promise((resolve, reject) => {
		const brotli = createBrotliDecompress();
		const source = createReadStream(archivePath);

		let buffer = Buffer.alloc(0);
		let currentWriter = null;
		let bytesRemaining = 0n;

		// State machine: 'header' | 'file'
		let state = 'header';

		const processBuffer = async () => {
			while (true) {
				if (state === 'header') {
					// Need at least 4 bytes for relPath length
					if (buffer.length < 4) break;
					const relPathLen = buffer.readUInt32BE(0);

					// Need 4 + relPathLen + 8 bytes for full header
					if (buffer.length < 4 + relPathLen + 8) break;

					const relPath = buffer.slice(4, 4 + relPathLen).toString('utf-8');
					const fileSize = buffer.readBigUInt64BE(4 + relPathLen);
					buffer = buffer.slice(4 + relPathLen + 8);

					const filePath = join(destPath, relPath);
					await mkdir(dirname(filePath), { recursive: true });

					if (currentWriter) currentWriter.end();
					currentWriter = createWriteStream(filePath);
					bytesRemaining = fileSize;
					state = 'file';

				} else if (state === 'file') {
					if (buffer.length === 0) break;

					const toWrite = bytesRemaining > BigInt(buffer.length)
						? buffer
						: buffer.slice(0, Number(bytesRemaining));

					await new Promise((res, rej) => {
						currentWriter.write(toWrite, (err) => err ? rej(err) : res());
					});

					bytesRemaining -= BigInt(toWrite.length);
					buffer = buffer.slice(toWrite.length);

					if (bytesRemaining === 0n) {
						state = 'header';
					} else {
						break;
					}
				}
			}
		};

		brotli.on('data', async (chunk) => {
			brotli.pause();
			buffer = Buffer.concat([buffer, chunk]);
			try {
				await processBuffer();
				brotli.resume();
			} catch (err) {
				reject(err);
			}
		});

		brotli.on('end', async () => {
			try {
				await processBuffer();
				if (currentWriter) currentWriter.end();
				resolve();
			} catch (err) {
				reject(err);
			}
		});

		brotli.on('error', reject);
		source.on('error', reject);

		source.pipe(brotli);
	});
};

await decompressDir();

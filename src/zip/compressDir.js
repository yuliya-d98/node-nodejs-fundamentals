import { createReadStream, createWriteStream } from 'fs';
import { readdir, stat, access, mkdir } from 'fs/promises';
import { createBrotliCompress } from 'zlib';
import { join, relative } from 'path';
import { pipeline } from 'stream/promises';
import { PassThrough } from 'stream';

const getAllFiles = async (dirPath, rootPath, result = []) => {
	const items = await readdir(dirPath);
	for (const item of items) {
		const fullPath = join(dirPath, item);
		const info = await stat(fullPath);
		if (info.isDirectory()) {
			await getAllFiles(fullPath, rootPath, result);
		} else {
			result.push({ fullPath, relPath: relative(rootPath, fullPath), size: info.size });
		}
	}
	return result;
};

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API

	const workspacePath = join(import.meta.dirname, 'workspace');
	const sourcePath = join(workspacePath, 'toCompress');
	const destPath = join(workspacePath, 'compressed');
	const archivePath = join(destPath, 'archive.br');

	try {
		await access(sourcePath);
	} catch {
		throw new Error('FS operation failed');
	}

	await mkdir(destPath, { recursive: true });

	const files = await getAllFiles(sourcePath, sourcePath);

	const pass = new PassThrough();
	const brotli = createBrotliCompress();
	const output = createWriteStream(archivePath);

	const writePromise = pipeline(pass, brotli, output);

	for (const { fullPath, relPath, size } of files) {
		// Write header: relPath length (4 bytes) + relPath + file size (8 bytes)
		const relPathBuf = Buffer.from(relPath, 'utf-8');
		const header = Buffer.alloc(4 + relPathBuf.length + 8);
		header.writeUInt32BE(relPathBuf.length, 0);
		relPathBuf.copy(header, 4);
		header.writeBigUInt64BE(BigInt(size), 4 + relPathBuf.length);
		pass.write(header);

		// Stream file content
		await new Promise((resolve, reject) => {
			const fileStream = createReadStream(fullPath);
			fileStream.on('data', (chunk) => pass.write(chunk));
			fileStream.on('end', resolve);
			fileStream.on('error', reject);
		});
	}

	pass.end();
	await writePromise;
};

await compressDir();

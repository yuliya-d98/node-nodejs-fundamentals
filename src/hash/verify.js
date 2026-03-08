import { createReadStream } from 'fs';
import { access, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { join } from 'path';

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL

	const checksumsPath = join(import.meta.dirname, 'checksums.json');

	try {
		await access(checksumsPath);
	} catch {
		throw new Error('FS operation failed');
	}

	const raw = await readFile(checksumsPath, 'utf-8');
	const checksums = JSON.parse(raw);

	const hashFile = (filePath) =>
		new Promise((resolve, reject) => {
			const hash = createHash('sha256');
			const stream = createReadStream(filePath);

			stream.on('data', (chunk) => {
				hash.update(chunk)
			});
			stream.on('end', () => {
				resolve(hash.digest('hex'));
			})
			stream.on('error', (err) => {
				reject()
			});
		});

	for (const [filename, expectedHash] of Object.entries(checksums)) {
		const filePath = join(import.meta.dirname, filename);

		try {
			const actualHash = await hashFile(filePath);
			const status = actualHash === expectedHash ? 'OK' : 'FAIL';
			console.log(`${filename} — ${status}`);
		} catch {
			console.log(`${filename} — FAIL`);
		}
	}
};

await verify();

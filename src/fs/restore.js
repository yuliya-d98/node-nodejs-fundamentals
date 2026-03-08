import { access, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

const restore = async () => {
	// Write your code here
	// Read snapshot.json
	// Treat snapshot.rootPath as metadata only
	// Recreate directory/file structure in workspace_restored

	const snapshotPath = join(import.meta.dirname, 'snapshot.json');

	try {
		await access(snapshotPath);
	} catch {
		throw new Error('FS operation failed');
	}

	const restorePath = join(import.meta.dirname, 'workspace_restored');

	try {
		await access(restorePath);
		throw new Error('FS operation failed');
	} catch (err) {
		if (err.message === 'FS operation failed') throw err;
		// Directory doesn't exist — expected, continue
	}

	let snapshot;
	try {
		const raw = await readFile(snapshotPath, 'utf-8');
		snapshot = JSON.parse(raw);
	} catch {
		throw new Error('FS operation failed');
	}

	await mkdir(restorePath, { recursive: true });

	for (const entry of snapshot.entries) {
		const targetPath = join(restorePath, entry.path);

		if (entry.type === 'directory') {
			await mkdir(targetPath, { recursive: true });
		} else if (entry.type === 'file') {
			await mkdir(dirname(targetPath), { recursive: true });
			const content = Buffer.from(entry.content, 'base64');
			await writeFile(targetPath, content);
		}
	}
};

await restore();

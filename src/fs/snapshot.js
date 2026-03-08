import { access, readdir, readFile, stat, writeFile } from 'fs/promises';
import { join, relative } from 'path';

const snapshot = async (workspaceDir) => {
	// Write your code here
	// Recursively scan workspace directory
	// Write snapshot.json with:
	// - rootPath: absolute path to workspace
	// - entries: flat array of relative paths and metadata

	const workspacePath = join(import.meta.dirname, 'workspace');

	try {
		await access(workspacePath);
	} catch {
		throw new Error('FS operation failed');
	}

	const entries = [];

	const scan = async (dirPath) => {
		let items;
		try {
			items = await readdir(dirPath);
		} catch {
			throw new Error('FS operation failed');
		}

		items.sort();

		for (const item of items) {
			const fullPath = join(dirPath, item);
			const relPath = relative(workspacePath, fullPath);
			const info = await stat(fullPath);

			if (info.isDirectory()) {
				entries.push({ path: relPath, type: 'directory' });
				await scan(fullPath);
			} else if (info.isFile()) {
				const content = await readFile(fullPath);
				entries.push({
					path: relPath,
					type: 'file',
					size: info.size,
					content: content.toString('base64'),
				});
			}
		}
	};

	await scan(workspacePath);

	const snapshotData = { rootPath: workspacePath, entries };
	await writeFile(join(import.meta.dirname, 'snapshot.json'), JSON.stringify(snapshotData, null, 2), 'utf-8');
};

await snapshot();

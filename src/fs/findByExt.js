import { access, readdir, stat } from 'fs/promises';
import { join, relative, extname } from 'path';

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)

	const args = process.argv.slice(2);
	const extIndex = args.indexOf('--ext');
	const rawExt = extIndex !== -1 && args[extIndex + 1] ? args[extIndex + 1] : 'txt';
	const ext = '.' + rawExt.replace(/^\./, '');

	const workspacePath = join(import.meta.dirname, 'workspace');

	try {
		await access(workspacePath);
	} catch {
		throw new Error('FS operation failed');
	}

	const results = [];

	const scan = async (dirPath) => {
		let items;
		try {
			items = await readdir(dirPath);
		} catch {
			throw new Error('FS operation failed');
		}

		await Promise.all(
			items.map(async (item) => {
				const fullPath = join(dirPath, item);
				const info = await stat(fullPath);

				if (info.isDirectory()) {
					await scan(fullPath);
				} else if (info.isFile() && extname(item) === ext) {
					results.push(relative(workspacePath, fullPath));
				}
			})
		);
	};

	await scan(workspacePath);

	results.sort();
	console.log(results.join('\n'));
};

await findByExt();

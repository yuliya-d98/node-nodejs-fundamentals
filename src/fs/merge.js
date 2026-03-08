import { access, readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

	const workspacePath = join(import.meta.dirname, 'workspace');
	const partsPath = join(workspacePath, 'parts');

	try {
		await access(partsPath);
	} catch {
		throw new Error('FS operation failed');
	}

	const args = process.argv.slice(2);
	const filesIndex = args.indexOf('--files');
	const filesArg = filesIndex !== -1 ? args[filesIndex + 1] : null;

	let filePaths;

	if (filesArg) {
		const fileNames = filesArg.split(',').map((f) => f.trim());
		filePaths = fileNames.map((f) => join(partsPath, f));

		for (const filePath of filePaths) {
			try {
				await access(filePath);
			} catch {
				throw new Error('FS operation failed');
			}
		}
	} else {
		let items;
		try {
			items = await readdir(partsPath);
		} catch {
			throw new Error('FS operation failed');
		}

		const txtFiles = items.filter((f) => extname(f) === '.txt').sort();

		if (txtFiles.length === 0) {
			throw new Error('FS operation failed');
		}

		filePaths = txtFiles.map((f) => join(partsPath, f));
	}

	const contents = await Promise.all(filePaths.map((f) => readFile(f, 'utf-8')));
	await writeFile(join(workspacePath, 'merged.txt'), contents.join(''), 'utf-8');
};

await merge();

import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';
import { join } from 'path';

const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)

	const args = process.argv.slice(2);
	const linesIndex = args.indexOf('--lines');
	const maxLines = linesIndex !== -1 && args[linesIndex + 1] ? Number(args[linesIndex + 1]) : 10;

	const sourcePath = join(import.meta.dirname, 'source.txt');

	let buffer = '';
	let chunkIndex = 1;
	let linesInChunk = 0;
	let currentWriter = createWriteStream(join(import.meta.dirname, `chunk_${chunkIndex}.txt`));

	const transform = new Transform({
		transform(chunk, _encoding, callback) {
			buffer += chunk.toString();
			const lines = buffer.split('\n');
			buffer = lines.pop();

			for (const line of lines) {
				currentWriter.write(`${line}\n`);
				linesInChunk++;

				if (linesInChunk >= maxLines) {
					currentWriter.end();
					chunkIndex++;
					linesInChunk = 0;
					currentWriter = createWriteStream(join(import.meta.dirname, `chunk_${chunkIndex}.txt`));
				}
			}

			callback();
		},
		flush(callback) {
			if (buffer.length > 0) {
				currentWriter.write(buffer);
			}
			currentWriter.end();
			callback();
		},
	});

	createReadStream(sourcePath).pipe(transform);
};

await split();

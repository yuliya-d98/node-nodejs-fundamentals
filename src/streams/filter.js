import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout

	const args = process.argv.slice(2);
	const patternIndex = args.indexOf('--pattern');
	const pattern = patternIndex !== -1 && args[patternIndex + 1] ? args[patternIndex + 1] : '';

	let buffer = '';

	const transform = new Transform({
		transform(chunk, _encoding, callback) {
			buffer += chunk.toString().replace(/^'+|'+$/gm, '');
			const lines = buffer.split('\n');
			buffer = lines.pop();

			for (const line of lines) {
				if (line.length > 0 && line.includes(pattern)) {
					this.push(`${line}\n`);
				}
			}

			callback();
		},
		flush(callback) {
			if (buffer.length > 0 && buffer.includes(pattern)) {
				this.push(`${buffer}\n`);
			}
			callback();
		},
	});

	pipeline(process.stdin, transform, process.stdout);
};

filter();

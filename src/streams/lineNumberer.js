import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout

	let lineNumber = 1;
	let buffer = '';

	const transform = new Transform({
		transform(chunk, _encoding, callback) {
			buffer += chunk.toString();
			const lines = buffer.split('\n');
			buffer = lines.pop();

			for (const line of lines) {
				this.push(`${lineNumber++} | ${line}\n`);
			}

			callback();
		},
		flush(callback) {
			if (buffer.length > 0) {
				this.push(`${lineNumber} | ${buffer}\n`);
			}
			callback();
		},
	});

	pipeline(process.stdin, transform, process.stdout);
};

lineNumberer();

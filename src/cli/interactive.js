import { createInterface } from 'readline';

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: '> ',
	});

	rl.prompt();

	rl.on('line', (line) => {
		const command = line.trim();

		switch (command) {
			case 'uptime':
				console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
				break;
			case 'cwd':
				console.log(process.cwd());
				break;
			case 'date':
				console.log(new Date().toISOString());
				break;
			case 'exit':
				console.log('Goodbye!');
				process.exit(0);
				break;
			default:
				console.log('Unknown command');
		}

		rl.prompt();
	});

	rl.on('close', () => {
		console.log('Goodbye!');
		process.exit(0);
	});

	rl.on('SIGINT', () => {
		console.log('Goodbye!');
		process.exit(0);
	});
};

interactive();

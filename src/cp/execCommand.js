import { spawn } from 'child_process';

const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child

	const command = process.argv[2];

	const isWindows = process.platform === 'win32';
	const cmd = isWindows ? 'cmd' : 'sh';
	const args = isWindows ? ['/c', command] : ['-c', command];

	const child = spawn(cmd, args, {
		env: process.env,
		stdio: ['inherit', 'pipe', 'pipe'],
	});

	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);

	child.on('close', (code) => {
		process.exit(code ?? 0);
	});
};

execCommand();

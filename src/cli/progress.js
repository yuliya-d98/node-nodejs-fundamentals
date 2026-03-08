const parseArgs = () => {
	const args = process.argv.slice(2);
	const getArgValue = (flag, def) => {
		const i = args.indexOf(flag);
		return i !== -1 && args[i + 1] !== undefined ? args[i + 1] : def;
	};
	return {
		duration: Number(getArgValue('--duration', 5000)),
		interval: Number(getArgValue('--interval', 100)),
		length: Number(getArgValue('--length', 30)),
		color: getArgValue('--color', null),
	};
};

const hexToAnsi = (hex) => {
	if (!hex) return null;
	const match = hex.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
	if (!match) return null;
	const [r, g, b] = [match[1], match[2], match[3]].map((v) => parseInt(v, 16));
	return `\x1b[38;2;${r};${g};${b}m`;
};

const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

	const { duration, interval, length, color } = parseArgs();
	const ansiColor = hexToAnsi(color);
	const steps = Math.floor(duration / interval);
	let step = 0;

	const tick = () => {
		step++;
		const percent = Math.min(Math.round((step / steps) * 100), 100);
		const filled = Math.round((percent / 100) * length);
		const empty = length - filled;

		const filledStr = '█'.repeat(filled);
		const emptyStr = ' '.repeat(empty);
		const coloredFilled = ansiColor ? `${ansiColor}${filledStr}\x1b[0m` : filledStr;

		process.stdout.write(`\r[${coloredFilled}${emptyStr}] ${percent}%`);

		if (step >= steps) {
			process.stdout.write('\nDone!\n');
		} else {
			setTimeout(tick, interval);
		}
	};

	setTimeout(tick, interval);
};

progress();

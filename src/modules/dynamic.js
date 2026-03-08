import { pathToFileURL } from 'url';
import { join } from 'path';

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

	const pluginName = process.argv[2];
	const pluginPath = pathToFileURL(join(import.meta.dirname, 'plugins', `${pluginName}.js`));

	let plugin;
	try {
		plugin = await import(pluginPath);
	} catch {
		console.log('Plugin not found');
		process.exit(1);
	}

	const result = plugin.run();
	console.log(result);
};

await dynamic();

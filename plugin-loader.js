export const pluginRegistry = [];

export function registerPlugin(plugin) {
  pluginRegistry.push(plugin);
}

export async function initPlugins(context) {
  const pluginList = [
    'plugin-toolbar.js',
    'plugin-format.js',
    'plugin-theme.js'
  ];

  for (const file of pluginList) {
    try {
      const module = await import(`./plugins/${file}`);
      // Plugin auto-registers via registerPlugin()
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
    }
  }

  pluginRegistry.forEach(plugin => plugin.setup(context));
}

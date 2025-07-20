export const pluginRegistry = [];

export function registerPlugin(plugin) {
  pluginRegistry.push(plugin);
}

export async function initPlugins(context) {
  const pluginList = [
    'plugin-toolbar.js'
  ];

  for (const file of pluginList) {
    try {
      await import(`./plugins/${file}`);
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
    }
  }

  pluginRegistry.forEach(p => p.setup(context));
}
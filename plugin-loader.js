export const pluginRegistry = [];

export function registerPlugin(plugin) {
  pluginRegistry.push(plugin);
}

export function initPlugins(editorContext) {
  pluginRegistry.forEach(plugin => plugin.setup(editorContext));
}
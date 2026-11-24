import { normalizePath, type Plugin } from 'vite';
import {
  checkCompiledKnowledge,
  writeCompiledKnowledge,
} from './knowledge-compiler';

/**
 * The browser imports the compiled interface. In a build, a stale interface is
 * a hard error: the page must not serve bytes that no source record produced.
 * In development, editing a Markdown record recompiles and reloads.
 */
export function knowledgePlugin(root: string): Plugin {
  const base = normalizePath(root) + '/';
  const isInput = (file: string) =>
    normalizePath(file).startsWith(base) && /^knowledge\/[^/]+\/[^/]+\.md$/.test(normalizePath(file).slice(base.length));

  return {
    name: 'beitie-knowledge-interface',
    buildStart() {
      const result = checkCompiledKnowledge(root);
      if (!result.ok) this.error(result.message);
    },
    configureServer(server) {
      server.watcher.on('all', (event, file) => {
        if (!['add', 'change', 'unlink'].includes(event) || !isInput(file)) return;
        try {
          writeCompiledKnowledge(root);
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error('Knowledge compile failed: ' + (error as Error).message);
        }
      });
    },
  };
}

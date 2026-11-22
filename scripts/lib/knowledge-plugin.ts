import { resolve } from 'node:path';
import { normalizePath, type Plugin } from 'vite';
import { loadDatasetFromDisk } from './dataset';
import { readKnowledge } from './knowledge';

const moduleId = 'virtual:beitie-knowledge';
const resolvedId = '\0' + moduleId;

export function knowledgePlugin(root: string): Plugin {
  const base = normalizePath(resolve(root)) + '/';
  function isInput(file: string) {
    const path = normalizePath(file);
    return path.startsWith(base) && /^(knowledge\/(works|people|notes)\/[^/]+\.md|data\/.*\.json)$/.test(path.slice(base.length));
  }
  return {
    name: 'beitie-knowledge',
    resolveId(id) {
      if (id === moduleId) return resolvedId;
    },
    load(id) {
      if (id !== resolvedId) return;
      const knowledge = readKnowledge(root, loadDatasetFromDisk(root), false);
      if (knowledge.errors.length) this.error(knowledge.errors.map(e => e.path + ': ' + e.message).join('\n'));
      return 'export const knowledgeArticles = ' + JSON.stringify(knowledge.articles)
        + ';\nexport const knowledgeRelations = ' + JSON.stringify(knowledge.relations) + ';';
    },
    configureServer(server) {
      server.watcher.on('all', (event, file) => {
        if (!['add', 'change', 'unlink'].includes(event) || !isInput(file)) return;
        const mod = server.moduleGraph.getModuleById(resolvedId);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

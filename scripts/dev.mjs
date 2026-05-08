import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const frontendRoot = resolve('frontend');
const viteEntry = require.resolve('vite', { paths: [frontendRoot] });

const [{ createServer: createViteServer }, { createApp }, { env }] = await Promise.all([
  import(pathToFileURL(viteEntry).href),
  import('../backend/src/app.js'),
  import('../backend/src/config/env.js'),
]);

const apiServer = createApp();

await new Promise((resolveListen, rejectListen) => {
  apiServer.once('error', rejectListen);
  apiServer.listen(env.port, env.host, resolveListen);
});

console.log(`[backend] http://${env.host}:${env.port}${env.apiPrefix}`);

const viteServer = await createViteServer({
  configFile: resolve(frontendRoot, 'vite.config.js'),
  root: frontendRoot,
  server: {
    host: 'localhost',
  },
});

await viteServer.listen();
viteServer.printUrls();

async function shutdown() {
  await viteServer.close();
  await new Promise((resolveClose) => apiServer.close(resolveClose));
}

process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

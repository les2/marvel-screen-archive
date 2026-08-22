import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const angularBrowser = resolve(root, 'dist/angular/browser');
const client = resolve(root, 'dist/client');
const server = resolve(root, 'dist/server');

if (!existsSync(angularBrowser)) throw new Error('Angular browser build not found.');
rmSync(client, { recursive: true, force: true });
rmSync(server, { recursive: true, force: true });
mkdirSync(client, { recursive: true });
mkdirSync(server, { recursive: true });
cpSync(angularBrowser, client, { recursive: true });
writeFileSync(resolve(server, 'index.js'), `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isAppNavigation = (request.method === 'GET' || request.method === 'HEAD') && !url.pathname.split('/').pop()?.includes('.');
    let response;
    if (isAppNavigation) {
      const fallback = new URL('/', request.url);
      response = await env.ASSETS.fetch(new Request(fallback, request));
    } else {
      response = await env.ASSETS.fetch(request);
      if (response.status === 404 && request.method === 'GET') {
        const fallback = new URL('/', request.url);
        response = await env.ASSETS.fetch(new Request(fallback, request));
      }
    }
    const type = response.headers.get('content-type') || '';
    if (type.includes('text/html')) {
      const html = (await response.text()).replaceAll('__ORIGIN__', new URL(request.url).origin);
      return new Response(html, { status: response.status, headers: response.headers });
    }
    return response;
  }
};
`.trimStart());

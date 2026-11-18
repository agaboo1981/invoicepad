import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

function siteUrlPlugin(siteUrl: string): Plugin {
  const origin = siteUrl.replace(/\/$/, '');
  return {
    name: 'site-url-and-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const withIncludes = html.replace(/<!--include:([\w./-]+)-->/g, (_match, file) =>
          readFileSync(resolve(root, file), 'utf8'),
        );
        return withIncludes.replaceAll('{{SITE_URL}}', origin);
      },
    },
    closeBundle() {
      const dist = resolve(root, 'dist');
      for (const file of ['sitemap.xml', 'robots.txt']) {
        const path = resolve(dist, file);
        if (existsSync(path)) {
          writeFileSync(path, readFileSync(path, 'utf8').replaceAll('{{SITE_URL}}', origin));
        }
      }
    },
  };
}

const pages = Object.fromEntries(
  readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace(/\.html$/, ''), resolve(root, file)]),
);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  const siteUrl = env.VITE_SITE_URL || 'https://invoicepad.shop';
  return {
    plugins: [siteUrlPlugin(siteUrl)],
    build: {
      rollupOptions: {
        input: pages,
      },
    },
  };
});

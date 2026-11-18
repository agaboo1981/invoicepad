import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));
const skipDirs = new Set(['dist', 'node_modules', 'partials', 'public', 'src', 'tests', 'docs', 'scripts', '.git']);

function htmlEntries(dir: string, prefix = ''): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.')) continue;
    const full = join(dir, item.name);
    if (item.isDirectory()) {
      if (skipDirs.has(item.name)) continue;
      Object.assign(entries, htmlEntries(full, `${prefix}${item.name}/`));
      continue;
    }
    if (!item.name.endsWith('.html')) continue;
    const key = `${prefix}${item.name.replace(/\.html$/, '')}`;
    entries[key] = full;
  }
  return entries;
}

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  const siteUrl = env.VITE_SITE_URL || 'https://invoicepad.shop';
  return {
    plugins: [siteUrlPlugin(siteUrl)],
    build: {
      rollupOptions: {
        input: htmlEntries(root),
      },
    },
  };
});

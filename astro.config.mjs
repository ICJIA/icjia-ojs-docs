// @ts-check
import { defineConfig } from 'astro/config';

// Static output served from the site root on Netlify. No adapter, no base path.
export default defineConfig({
  output: 'static',
  build: {
    // Emit /docs/slug/index.html so URLs stay extensionless.
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});

import { defineConfig } from 'astro/config'

// SSG by default — content is fetched from Payload at build time and the
// output is plain static HTML/CSS/JS. The dev server still hot-reloads.
export default defineConfig({
  output: 'static',
  server: { port: 4321, host: true },
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
})

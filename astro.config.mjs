import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ streaming: false }),
  integrations: [
    tailwind(),
    react()
  ],
  vite: {
    plugins: [
      {
        name: 'inject-messagechannel-polyfill',
        renderChunk(code) {
          return 'if (typeof MessageChannel === "undefined") { globalThis.MessageChannel = class { constructor() { this.port1 = { postMessage() {}, onmessage: null, close() {} }; this.port2 = { postMessage() {}, onmessage: null, close() {} }; } } }\n' + code;
        }
      }
    ]
  }
});

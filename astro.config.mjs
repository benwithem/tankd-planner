import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({ streaming: false }),
  integrations: [
    tailwind({
      // Explicitly enable CSS variable mode in Tailwind for shadcn/ui
      applyBaseStyles: true,
    }),
    react({
      include: ['**/TankPlanner/**/*.tsx'],
      jsx: 'react-jsx'
    })
  ],
  // Enable content collections
  collections: {
    enabled: true
  },
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

// This file serves as an entry point for Cloudflare Pages Functions
export async function onRequest({ request, env, next }) {
    // Forward the request to Astro's server-side rendering
    return next();
  }
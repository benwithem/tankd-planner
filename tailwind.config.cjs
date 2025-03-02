/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          'aqua-blue': '#1e88e5',
          'aqua-green': '#26a69a',
        },
      },
    },
    plugins: [],
  }
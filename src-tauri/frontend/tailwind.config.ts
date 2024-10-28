import { nextui } from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/[object Object].js"
  ],
  theme: {
    extend: {
      fontFamily: {
        anime: ['var(--font-dela-gothic-one)'],
        anime2: ['var(--font-bangers)'],
      },
      colors: {
        inactive: '#57534e',
        tools: '#374151',
        controls: {
          100: '#4338ca',
          200: '#3730a3',   // hover
          300: '#6366f1',   // active
        },
        info: '#60A5FA',
        error: '#b91c1c',
        media: '#16a34a',
        dir: '#3b82f6',
      },
    },
  },
  plugins: [nextui()],
};
export default config;

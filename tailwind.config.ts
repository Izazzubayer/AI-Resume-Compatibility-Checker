import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
                mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
            },
        },
    },
};

export default config;

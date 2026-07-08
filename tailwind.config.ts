import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EF",
        paper: "#FFFDF8",
        sage: "#CBD6C2",
        "sage-light": "#DCE3D2",
        moss: "#7E8C6A",
        "moss-deep": "#49523E",
        "moss-night": "#3C4433",
        clay: "#C98E70",
        "clay-deep": "#B0714F",
        "clay-soft": "#F1E0D2",
        wood: "#9A7B5A",
        sand: "#E7D8C5",
        water: "#AECAC4",
        ink: "#3A352F",
        "ink-soft": "#6B6258",
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

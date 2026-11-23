import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aesthetic: Modern Espresso & Warm Terracotta
        roast: {
          charcoal: "#1F2421", // charcoal header & dark surfaces
          espresso: "#2A1810", // deep espresso roast
          crema: "#D97706",    // rich crema amber
          amber: "#9A3412",    // warm terracotta / rust accent
          caramel: "#C2410C",  // warm caramel
          warmbg: "#FAF8F6",   // alabaster warm background
          card: "#FFFFFF",     // crisp white card
          parchment: "#F4EFEA",// light coffee parchment
          border: "#E7DFD8",   // subtle warm border
          subtle: "#78716C",   // muted text (stone-500)
          muted: "#57534E",    // secondary text (stone-600)
          dark: "#141715",     // darkest black/charcoal
        },
        coffee: {
          50: "#FAF8F6",
          100: "#F5EFE9",
          200: "#E8DDD1",
          300: "#D3BEA7",
          400: "#BA987A",
          500: "#9A3412",
          600: "#7C2D12",
          700: "#5A2310",
          800: "#3E1A0E",
          900: "#1F2421",
        }
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(31, 36, 33, 0.04), 0 1px 2px -1px rgba(31, 36, 33, 0.04)',
        'warm-md': '0 4px 6px -1px rgba(42, 24, 16, 0.07), 0 2px 4px -2px rgba(42, 24, 16, 0.05)',
        'warm-lg': '0 10px 15px -3px rgba(42, 24, 16, 0.08), 0 4px 6px -4px rgba(42, 24, 16, 0.04)',
      }
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./views/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      tablet: "1350px",
      phone: "1100px",
    },
    extend: {
      colors: {
        transparent: "transparent",
        background: "#100d26",
        text: "#FFFFFF",
        "text-gray": {
          light: "#DFDFDF",
          dark: "#BABABA",
        },
        textbox: "#b9b3e540",
        // 'textbox': '#3a3756',
        primary: {
          100: "#FFE6EE",
          200: "#E5B3C3",
          300: "#CA7892",
          400: "#B04C6B",
          DEFAULT: "#8D2547",
          600: "#7B1A37",
          700: "#610E27",
          800: "#47081A",
          900: "#2B050F",
        },
        secondary: {
          100: "#E9E6FF",
          200: "#B9B3E5",
          300: "#8278CA",
          400: "#584CB0",
          DEFAULT: "#32258D",
          600: "#251A7B",
          700: "#180E61",
          800: "#0F0847",
          900: "#09052B",
        },
        success: {
          light: "#E6FFF2",
          dark: "#2BCB77",
        },
        error: {
          light: "#FFEBEE",
          dark: "#CC2B48",
        },
        accent: "#4636D9",
        tedx: "#EB0028",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        body: "Ubuntu, sans-serif",
        small: "Ubuntu, sans-serif",
        button: "Bungee, sans-serif",
        title: "Poppins, sans-serif",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 필요하면 여기서 폰트페밀리, 색상 등을 확장하세요
      fontFamily: {
        hepta: ["Hepta_Slab-Regular", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        questrial: ["Questrial-Regular", "sans-serif"],
        "sora": ["Sora-Regular", "sans-serif"],
        "sora-bold": ["Sora-Bold", "sans-serif"],
        "sora-extrabold": ["Sora-ExtraBold", "sans-serif"],
        "sora-medium": ["Sora-Medium", "sans-serif"],
        "sora-semibold": ["Sora-SemiBold", "sans-serif"],
        "sora-light": ["Sora-Light", "sans-serif"],
      },
    },
  },
  plugins: [],
}
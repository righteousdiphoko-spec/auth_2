/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: { extend: { colors: { ink: "#17232d", coral: "#e76f51", mist: "#f4f1ea" }, fontFamily: { display: ["Georgia", "serif"], sans: ["ui-sans-serif", "system-ui", "sans-serif"] } } },
  plugins: []
};

module.exports = {
  content: [
    "./index.html",
    "./srcs/**/*.ts",
  ],
  safelist: [
    "bg-blue-600",
    "text-white",
    "rounded",
    "px-4",
    "py-2",
    "hover:bg-blue-700"
  ],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 5s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [],
};
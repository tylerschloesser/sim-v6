/** @type {import('tailwindcss').Config} */
export default {
  jit: true,
  content: ['./src/**/*.{html,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  future: {
    // https://github.com/tailwindlabs/tailwindcss/discussions/1739#discussioncomment-3630717
    hoverOnlyWhenSupported: true,
  },
}

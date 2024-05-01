/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        header: 'linear-gradient(#d4d3d3 0%, #9a9e9d 100%)',
        // body: 'linear-gradient(90deg, #d4d3d3 0%, #9a9e9d 100%)',
        playbar: 'linear-gradient(#5F5B5C 0%, #3C3A3C 100%)',
      },
      colors: {
        black: '#120b2e',
        green: '#7eb817',

        sidebar: '#474747',
        'sidebar-border': '#28221D',
        'sidebar-hover': '#666',
        'sidebar-header': '#737369',

        main: '#312F32',
        'main-odd': '#2E2A2D',
        'main-border': '#28221D',
        'main-hover': '#666',

        'sidebar-active': 'linear-gradient(90deg, #c0e1f5 0%, #9cd3f9 100%)',
        'text-input': '#fefefe',
      },
    },
  },
  plugins: [],
}

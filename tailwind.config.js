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
        separator: 'linear-gradient(#585658 0%, #464448 100%);',
      },
      colors: {
        // black: '#120b2e',
        // green: '#7eb817',

        gray: {
          50: '#f7f7f8',
          100: '#f1f1f2',
          200: '#e6e4e6',
          300: '#d2ced3',
          400: '#b6b0b6',
          500: '#9e969e',
          600: '#7f767f',
          700: '#6f676e',
          800: '#5d575c',
          900: '#504b50',
          950: '#2d2a2d',
        },

        sidebar: '#474747',
        'sidebar-border': '#28221D',
        'sidebar-hover': '#666',
        'sidebar-selected': '#333',
        'sidebar-header': '#737369',

        main: '#312F32',
        'main-odd': '#2E2A2D',
        'main-border': '#28221D',
        'main-hover': '#666',
        'table-header': '#807c83',

        'sidebar-active': 'linear-gradient(90deg, #c0e1f5 0%, #9cd3f9 100%)',
        'text-input': '#fefefe',
      },
    },
  },
  plugins: [],
}

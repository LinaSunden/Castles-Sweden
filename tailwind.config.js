/** @type {import('tailwindcss').Config} */

import plugin from 'tailwindcss/plugin'

export const content = [
  './index.html',
  './map.html',
  './css/*.css',
  './js/base.js',
]
export const theme = {
  extend: {
    height: {
      '700px': '700px',
    },
    textShadow: {
      sm: '0 1px 2px var(--tw-shadow-color)',
      DEFAULT: '0 2px 4px var(--tw-shadow-color)',
      lg: '0 8px 16px var(--tw-shadow-color)',
    },
    colors: {
      'delft-blue': '#142F57',
      'steel-blue': '#497DB4',
      'paynes-grey': '#597186',
    },
    plugins: [
      plugin(function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            'text-shadow': (value) => ({
              textShadow: value,
            }),
          },
          { values: theme('textShadow') }
        )
      }),
    ],
  }
}

import turboConfig from 'eslint-config-turbo/flat'

export default [
  ...turboConfig,
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/.turbo/**',
    ],
  },
]

module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:react/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/no-unstable-nested-components': 'off',
      },
    },
  ],
};

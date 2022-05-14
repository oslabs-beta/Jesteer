module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    chrome: false,
  },
  rules: {
    'import/extensions': ['error', 'always', { ignorePackages: true }],
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'one-var': 'off',
    'one-var-declaration-per-line': 'off',
  },
};

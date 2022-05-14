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
    getSelectorPath: false,
  },
  rules: {
    'import/extensions': ['error', 'always', { ignorePackages: true }],
    'brace-style': ['error', 'stroustrup'],
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'one-var': 'off',
    'one-var-declaration-per-line': 'off',
  },
};

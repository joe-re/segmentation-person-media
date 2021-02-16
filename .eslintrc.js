module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'prettier/@typescript-eslint',
    ],
    rules: {
      "max-len": ["error", { "code": 80 }],
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  };
module.exports = {
  parser: '@babel/eslint-parser',
  extends: 'airbnb-base',
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    'no-continue': 'off',
    'no-underscore-dangle': 'off',
    'max-len': [
      'warn', {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'padding-line-between-statements': [
      'warn', {
        blankLine: 'always',
        prev: [
          'block',
          'block-like',
          'cjs-export',
          'class',
          'export',
          'import',
        ],
        next: '*',
      }, {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      }, {
        blankLine: 'any',
        prev: ['cjs-import'],
        next: ['cjs-import'],
      },
    ],
  },
};

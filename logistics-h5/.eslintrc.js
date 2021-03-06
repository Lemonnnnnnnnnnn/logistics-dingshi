module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    wx: true,
    APP_TYPE: true,
    page: true
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.jsx'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/no-multi-comp': 0,
    'react/sort-comp': 0,
    'react/prefer-stateless-function': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/destructuring-assignment': 0,
    'import/no-dynamic-require': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [
      2,
      {
        optionalDependencies: true,
        devDependencies: ['**/tests/**.js', '/mock/**.js', '**/**.test.js'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
    'no-multi-assign': 0,
    'no-console': 0,
    'no-return-assign': 0,
    'indent': [
      'error',
      2,
      {
        ignoredNodes: ["TemplateLiteral"],
        SwitchCase: 1,
        flatTernaryExpressions: true
      }],
    'keyword-spacing': 1,
    'class-methods-use-this':0,
    'space-before-function-paren': ["error", "always"],
    'comma-spacing': 1,
    'brace-style': 1,
    'block-spacing': 2,
    'no-unused-expressions':[0,{ "allowShortCircuit": true }],
    "no-irregular-whitespace": 2,
    "no-prototype-builtins": 0,
    'semi': 0,
    'no-underscore-dangle': 0,
    'no-return-await': 0,
    'no-shadow': 0,
    'no-multi-spaces': [2, {"ignoreEOLComments": true, "exceptions": { "Property": false }}],
    'no-plusplus': 0,
    'consistent-return':0,
    'no-trailing-spaces':2,
    'nonblock-statement-body-position': 2,
    'object-curly-spacing':1,
    'no-use-before-define': 0,
    'no-param-reassign': 0
  },
  settings: {
    polyfills: ['fetch', 'promises', 'url'],
  },
};

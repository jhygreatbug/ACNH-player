module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: [1, 'never'],
    'no-plusplus': [1, { allowForLoopAfterthoughts: true }],
    '@typescript-eslint/member-delimiter-style': [
      1,
      { multiline: { delimiter: 'none' } },
    ],
  },
}

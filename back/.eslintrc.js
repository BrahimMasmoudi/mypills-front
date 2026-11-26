module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'google',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module',
    },
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
        '/generated/**/*', // Ignore generated files.
        'migrations/**/*',
    ],
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    rules: {
        'quotes': ['error', 'single'],
        'import/no-unresolved': 0,
        'indent': 'off',
        'semi': 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        'max-len': 'off',
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'object-curly-spacing': ['error', 'always'],
        'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: false,
                },
                singleline: {
                    delimiter: 'comma',
                    requireLast: false,
                },
            },
        ],
    },
}

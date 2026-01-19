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
    ],
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    rules: {
        'quotes': ['error', 'single'],
        'import/no-unresolved': 0,
        'indent': 'off',
        // --- ADD THESE ---
        'semi': 'off', // Turn off the standard semi rule
        '@typescript-eslint/semi': ['error', 'never'], // Use the TS version and set to 'never'
        // --- ADD THESE TO FIX YOUR ERRORS ---
        'max-len': 'off',                 // Disable the 80-character limit
        'require-jsdoc': 'off',            // Disable required JSDoc comments
        'valid-jsdoc': 'off',              // Disable JSDoc validation
        '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' for now (especially in tests)
        '@typescript-eslint/no-non-null-assertion': 'off', // Allow '!' (process.env.GCLOUD_PROJECT!)
        'object-curly-spacing': ['error', 'always'], // Better readability
        'no-multiple-empty-lines': ['error', {'max': 1, 'maxEOF': 0}],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'none', // No semicolon/comma at the end of lines in interfaces
                    requireLast: false,
                },
                singleline: {
                    delimiter: 'comma', // Use commas for single-line types
                    requireLast: false,
                },
            },
        ],
    },
};

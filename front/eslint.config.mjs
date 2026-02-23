import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    rules: {
        // Override any rules here
        'quotes': ['error', 'single'],
        'object-curly-spacing': ['error', 'always'],
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'prefer-const': 'off',
        '@typescript-eslint/unified-signatures': 'off',

        // Vue template formatting
        'vue/html-indent': ['error', 2, {
            'attribute': 1,
            'baseIndent': 1,
            'closeBracket': 0,
            'alignAttributesVertically': false,
        }],
        'vue/first-attribute-linebreak': ['error', {
            'singleline': 'ignore',
            'multiline': 'below'
        }],
        'vue/max-attributes-per-line': ['error', {
            'singleline': { 'max': 3 },
            'multiline': { 'max': 1 }
        }],
        'vue/html-closing-bracket-newline': ['error', {
            'singleline': 'never',
            'multiline': 'always'
        }],
    }
})
    .append({
        files: ['server-worker/sw.js'],
        languageOptions: {
            globals: {
                clients: 'readonly'
            }
        }
    })

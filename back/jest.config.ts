module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Look for .spec.ts or .test.ts files anywhere in src
    testMatch: ['**/src/**/*.spec.ts', '**/src/**/*.test.ts'],
    // Recommended: help Jest find your absolute imports if you use them in tsconfig
    moduleDirectories: ['node_modules', 'src'],
}
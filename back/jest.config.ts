module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/src/**/*.spec.ts', '**/src/**/*.test.ts'],
    moduleDirectories: ['node_modules', 'src'],
    testTimeout: 20000,
    setupFiles: ['<rootDir>/jest.setup.ts'],
}
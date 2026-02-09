import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const firstEquals = trimmedLine.indexOf('=');
        if (firstEquals !== -1) {
            const key = trimmedLine.substring(0, firstEquals).trim();
            const value = trimmedLine.substring(firstEquals + 1).trim();
            // Assign to process.env if not already set (or override if preferred)
            process.env[key] = value;
        }
    });
}

// Special overrides for tests to ensure they point to emulator
if (!process.env.GITHUB_ACTIONS) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}

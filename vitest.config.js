import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
        exclude: ['tests/e2e/**', 'node_modules/**'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js'],
            reporter: ['text', 'lcov']
        }
    }
});

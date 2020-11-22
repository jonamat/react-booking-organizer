const { configure } = require('@testing-library/dom');
const dotenv = require('dotenv');
const path = require('path')

// Disable massive DOM logs during testing library renders
configure({
    getElementError: (message, container) => {
        const error = new Error(message);
        error.name = 'TestingLibraryElementError';
        error.stack = null;
        return error;
    },
});

// Disable console errors and warns from source
console.error = jest.fn();
console.warn = jest.fn();

// Import env vars
global.process.env = {
    ...global.process.env,
    ...dotenv.config({ path: path.resolve(__dirname, '..', 'sandbox.env') }).parsed,
    NODE_ENV: 'production',
    TARGET_DB: 'sandbox',
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            TARGET_DB: 'sandbox' | 'production';
            API_KEY: string;
            AUTH_DOMAIN: string;
            DATABASE_URL: string;
            PROJECT_ID: string;
            STORAGE_BUCKET: string;
            MESSAGING_SENDER_ID: string;
            APP_ID: string;
            COMPANY_NAME: string;
            PHONE: string;
            EMAIL: string;
            TELEGRAM: string;
        }
    }
}

export {};

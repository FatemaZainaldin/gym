export default () => ({
    app: {
        port: parseInt(process.env.PORT ?? '3000', 10),
        frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
        env: process.env.NODE_ENV ?? 'development',
    },
    db: {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        name: process.env.DB_NAME ?? 'gym_db',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD ?? 'redis_secret',
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access_secret_CHANGE_ME',
        refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_CHANGE_ME',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    },
    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
    },
    email: {
        from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
        sendgridKey: process.env.SENDGRID_API_KEY ?? '',
    },
});
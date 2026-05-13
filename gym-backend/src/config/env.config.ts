export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    host: process.env.DB_HOST || 'localhost',

    port: parseInt(process.env.DB_PORT || '5432', 10),

    username: process.env.DB_USERNAME || 'postgres',

    password: process.env.DB_PASSWORD || 'postgres',

    name: process.env.DB_NAME || 'gym_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access_secret_CHANGE_ME',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_CHANGE_ME',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
});

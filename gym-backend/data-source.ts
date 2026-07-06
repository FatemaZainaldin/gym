import { DataSource } from 'typeorm';
import 'dotenv/config';

export default new DataSource({
  type:     'postgres',
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     +(process.env.DB_PORT   ?? 5432),
  username: process.env.DB_USER     ?? 'postgres',
  password: process.env.DB_PASS     ?? 'postgres',
  database: process.env.DB_NAME     ?? 'gymgym_db',

  entities: [  
    __dirname + '/../**/*.entity{.ts,.js}',
],
  migrations: ['src/migrations/*.ts'],

  synchronize: false,
  logging:     true,
});
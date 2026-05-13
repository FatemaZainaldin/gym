import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'gym_db',
  entities: [  
    __dirname + '/../**/*.entity{.ts,.js}',
],
  migrations: ['src/migrations/*.ts'],
});

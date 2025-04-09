import 'dotenv/config';
import * as process from 'process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'node:path';
import { DataSourceOptions } from 'typeorm';

const dbConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'story-stream',
  entities: [path.join(__dirname, '..', '**', '*.entity{.js, .ts}')],
  synchronize: process.env.NODE_ENV === 'development',
};

export const typeOrmConfig: TypeOrmModuleOptions = dbConfig as TypeOrmModuleOptions;
export const dataSourceConfig: DataSourceOptions = dbConfig as DataSourceOptions;

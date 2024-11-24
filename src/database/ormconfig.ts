import { TypeOrmModuleOptions  } from '@nestjs/typeorm';
require('dotenv').config();

const ormConfig: TypeOrmModuleOptions   = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'exam_db',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
    logger: 'simple-console',
    migrationsRun: true,
    migrations: [__dirname + '/migrations/**/*.{ts,js}'],
  };
  
  export = ormConfig;
  
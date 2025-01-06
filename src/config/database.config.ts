import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ConfigService } from '@nestjs/config';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

export const getDatabaseConfig = (configService?: ConfigService): TypeOrmModuleOptions => {
  const baseConfig = {
    type: 'mysql' as const,
    host: configService?.get('database.host') || process.env.DB_HOST || 'localhost',
    port: configService?.get('database.port') || parseInt(process.env.DB_PORT, 10) || 3306,
    username: configService?.get('database.username') || process.env.DB_USERNAME || 'root',
    password: configService?.get('database.password') || process.env.DB_PASSWORD || 'root',
    database: configService?.get('database.database') || process.env.DB_DATABASE || 'nurse_exam_db',
    autoLoadEntities: true,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
    migrationsRun: true,
    retryAttempts: 5,
    retryDelay: 3000,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : undefined,
    keepConnectionAlive: true
  };

  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseConfig,
      synchronize: false,
      logging: ['error'],
    };
  }

  return {
    ...baseConfig,
    synchronize: true,
    logging: true,
  };
};
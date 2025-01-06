import { Module, OnModuleInit  } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from './email/email.module';
import { AuthModule } from './modules/auth.module';
import { ContactModule } from './modules/contact.module';
import { APP_FILTER } from '@nestjs/core';
import { RolesModule } from './modules/roles.module';
import { RolesService } from './services/roles.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LogModule } from './modules/log.module';
import { ExamModule } from './modules/exam.module';
import { InquiryModule } from './modules/inquiry.module';
import { GroupModule } from './modules/group.module';
import { adminConfig, databaseConfig, googleCloudConfig, jwtConfig, smtpConfig } from './config/configuration';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, 
      load: [databaseConfig, jwtConfig, adminConfig, googleCloudConfig, smtpConfig],
      isGlobal: true }),
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => (getDatabaseConfig(configService)),
      }),

    //approach 2
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: configService.get('database.host'),
    //     port: configService.get('database.port'),
    //     username: configService.get('database.username'),
    //     password: configService.get('database.password'),
    //     database: configService.get('database.database'),
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: process.env.NODE_ENV !== 'production',
    //     logging: true,
    //     logger: 'simple-console',
    //     migrationsRun: true,
    //     migrations: [__dirname + '/database/migrations/**/*.{ts,js}'],
    //     retryAttempts: 5,
    //     retryDelay: 3000,
    //     connectTimeout: 60000, // 60 seconds
    //   }),
    // }),

    //approach 1
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: parseInt(process.env.DB_PORT) || 3306,
    //   username: process.env.DB_USERNAME || 'root',
    //   password: process.env.DB_PASSWORD || 'root',
    //   database: process.env.DB_DATABASE || 'medprepdb`',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    //   logging: false,
    //   logger: 'simple-console',
    //   migrationsRun: true,
    //   migrations: [__dirname + '/database/migrations/**/*.{ts,js}'],
    //   connectTimeout: 60000, // 60 seconds
    // }),

    
    //TypeOrmModule.forFeature([LogRepository]),
    AuthModule,
    RolesModule,
    ContactModule,
    EmailModule,
    LogModule,
    ExamModule,
    InquiryModule,
    GroupModule
  ],
  providers: [
    //CustomLoggerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ]
})
export class AppModule implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}

  async onModuleInit() {
    //await this.rolesService.createInitialRoles();
  }

}

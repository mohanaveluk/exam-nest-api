import { Module, OnModuleInit  } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,  envFilePath: `.env.${process.env.NODE_ENV || 'development'}` }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'exam_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      logger: 'simple-console',
      migrationsRun: true,
      migrations: [__dirname + '/database/migrations/**/*.{ts,js}'],
      connectTimeout: 60000, // 60 seconds
    }),
    //TypeOrmModule.forFeature([LogRepository]),
    AuthModule,
    RolesModule,
    ContactModule,
    EmailModule,
    LogModule,
    ExamModule,
    InquiryModule
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

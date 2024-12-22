import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.entity';
import { JwtStrategy } from '../middleware/jwt.strategy';
import { PasswordArchive } from 'src/models/password-archive.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import * as dotenv from 'dotenv';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { DateService } from 'src/services/date.service';
import { RoleEntity } from 'src/models/roles.entity';
import { TokenController } from 'src/controllers/token.controller';
import { TokenService } from 'src/services/token.service';
import { RefreshToken } from 'src/models/user/refresh-token.entity';
import { StorageService } from 'src/services/storage.service';
import { OTC } from 'src/models/user/otc.entity';
import { EmailService } from 'src/email/email.service';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, PasswordArchive, RoleEntity, OTC]),
    PassportModule.register({ defaultStrategy: 'jwt' ,
      session: false}),
    
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: 'auth-service' 
      },
    }),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     secret: configService.get<string>('JWT_SECRET'),
    //     signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
    //   }),
    // }),

  ],
  controllers: [AuthController, TokenController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    AuthorizationGuard,
    DateService,
    TokenService,
    StorageService,
    EmailService
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    /*{
      provide: JwtAuthGuard,
      useFactory: (reflector: Reflector, jwtService: JwtService) => {
        return new JwtAuthGuard(jwtService, reflector);
      },
      inject: [Reflector, JwtService]
    }*/
  ],
  exports: [AuthService,  PassportModule, DateService, TokenService, StorageService],
})
export class AuthModule { }
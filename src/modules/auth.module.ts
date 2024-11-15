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
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordArchive]),
    PassportModule.register({ defaultStrategy: 'jwt' ,
      session: false}),
    
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: '1h',
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
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    AuthorizationGuard,
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
  exports: [AuthService,  PassportModule],
})
export class AuthModule { }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { use } from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RoleEntity } from 'src/models/roles.entity';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: false
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { uguid: payload.sub }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: user.role_id }
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: role !== null && role !== undefined ? role.name : ''
    };
  }
}


/*
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return only necessary user data
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token payload');
    }
  }
}
  */
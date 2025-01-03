import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { Constants } from 'src/shared/constants/constants';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService, private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET || 'your-secret-key'
        }
      );
      // 💡 We're assigning the payload to the request object here so that we can access it in our route handlers
      console.log(payload);
      request['user'] = payload;
    } catch(error) {
      if (error?.name === Constants.EXCEPTION.TOKEN_EXPIRED_ERROR) {
        throw new UnauthorizedException(Constants.AUTH.TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(Constants.AUTH.UN_AUTHORIZED);
    }
    return (await super.canActivate(context)) as boolean;
    //return true;

  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If we have an error or no user, throw an error
    if (err) {
      throw err;
    }

    const request = context.switchToHttp().getRequest();
    // Use the decoded user from the request if passport validation fails
    const decodedUser = request.user;

    if (!user && !decodedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Return either the passport validated user or our decoded user
    return user || decodedUser;
  }

  private extractTokenFromHeader(request: Request| any): string | undefined {
    const authorizationHeader = request.headers.authorization;
    const [type, token] = authorizationHeader ? authorizationHeader.split(' ') : [];

   //const [type, token] = request.headers.authorization?.split(' ') ? [];
    return type === 'Bearer' ? token : undefined;
  }

  /*
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Get the request object
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    // Ensure proper Bearer token format
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Verify token using JwtService
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    return (await super.canActivate(context)) as boolean;
    

  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If we have an error or no user, throw an error
    if (err) {
      throw err;
    }

    const request = context.switchToHttp().getRequest();
    // Use the decoded user from the request if passport validation fails
    const decodedUser = request.user;

    if (!user && !decodedUser) {
      throw new UnauthorizedException('User not found');
    }

    // Return either the passport validated user or our decoded user
    return user || decodedUser;
  }

  */
  
  /*  
    constructor(private jwtService: JwtService, private reflector: Reflector) {
        super();
      }

      async canActivate(context: ExecutionContext): Promise<boolean>  {

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        if (!token) {
            throw new UnauthorizedException('No token provided');
          }
      
          try {
            const payload = await this.jwtService.verifyAsync(token);
            request['user'] = payload;
            return true;
          } catch (error) {
            throw new UnauthorizedException('Invalid token');
          }
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Invalid or expired token');
        }
        return user;
    }

    private extractTokenFromHeader(request: Request | any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ? [];
        return type === 'Bearer' ? token : undefined;
      }*/
  /*    

  constructor(private readonly  jwtService: JwtService) {
    super();
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if(request.url === '/auth/login' || request.url === '/auth/register') return true;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      return true;
    } catch (error) {
      console.error('Error verifying token:', error); // Log the error
      throw new UnauthorizedException('Invalid token');
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }

  private extractTokenFromHeader(request: Request | any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ? [];
    return type === 'Bearer' ? token : undefined;
  }
      */

}
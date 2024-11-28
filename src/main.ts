import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CorsUtil } from './shared/utils/cors.util';
import * as http from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer() as http.Server;
  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1');
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  //app.useGlobalGuards(new JwtAuthGuard(app.get(JwtService), app.get(Reflector)));
  //app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  // cors
  app.enableCors(CorsUtil());
  
  // Set the timeout value for sockets (in milliseconds)
  server.setTimeout(120000); // 120 seconds

  // Set the keep-alive timeout (in milliseconds)
  server.keepAliveTimeout = 30000; // 30 seconds

  // Set the headers timeout (in milliseconds)
  server.headersTimeout = 31000; // 31 seconds

  // Only enable Swagger in development mode
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Authentication API')
      .setDescription('API documentation for authentication and contact endpoints')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'JWT-auth'
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function CorsUtil() {
  return {
    origin: '*',
    methods: '*',
    exposedHeaders: '*',
  };
}

export const corsConfig: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 3600
};
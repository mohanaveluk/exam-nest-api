import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from 'src/models/log.entity';
import { LogRepository } from 'src/repository/log.repository';
import { CustomLoggerService } from 'src/services/custom-logger.service';


@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LogModule {}
import { Log } from 'src/models/log.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Log)
export class LogRepository extends Repository<Log> {}
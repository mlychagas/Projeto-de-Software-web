import { Module } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';

@Module({
  imports: [],
  controllers: [AulaController],
  providers: [AulaService],
  exports: [AulaService]
})
export class AulaModule {}

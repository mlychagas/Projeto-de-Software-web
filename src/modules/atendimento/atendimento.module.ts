import { Module } from '@nestjs/common';
import { AtendimentoController } from './atendimento.controller';
import { PessoaModule } from '../pessoa/pessoa.module';
import { DatabaseModule } from '../../config/database/database.module';

@Module({
  imports: [PessoaModule, DatabaseModule],
  controllers: [AtendimentoController]
})
export class AtendimentoModule {}

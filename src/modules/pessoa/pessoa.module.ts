import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../config/database/database.module';
import { PessoaController } from './pessoa.controller';
import { PessoaService } from './pessoa.service';

@Module({
    imports: [DatabaseModule],
    controllers: [PessoaController],
    providers: [PessoaService],
    exports: [PessoaService]
})
export class PessoaModule {}

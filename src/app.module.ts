import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { AlunoModule } from './modules/aluno/aluno.module';
import { ResponsavelAlunoModule } from './modules/responsavel-aluno/responsavel-aluno.module';
import { AulaModule } from './modules/aula/aula.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { CursoModule } from './modules/curso/curso.module';
import { SalaModule } from './modules/sala/sala.module';
import { TurmaModule } from './modules/turma/turma.module';
import { ContratoModule } from './modules/contrato/contrato.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { MinistraModule } from './modules/ministra/ministra.module';
import { DisponibilidadeProfessorModule } from './modules/disponibilidade-professor/disponibilidade-professor.module';
import { MatriculaModule } from './modules/matricula/matricula.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AlunoModule,
    ResponsavelAlunoModule,
    AulaModule,
    ProfessorModule,
    CursoModule,
    SalaModule,
    TurmaModule,
    ContratoModule,
    AgendaModule,
    MinistraModule,
    DisponibilidadeProfessorModule,
    MatriculaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

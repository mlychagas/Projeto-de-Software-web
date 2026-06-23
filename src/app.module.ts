import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { PessoaModule } from './modules/pessoa/pessoa.module';
import { AulaModule } from './modules/aula/aula.module';
import { CursoModule } from './modules/curso/curso.module';
import { SalaModule } from './modules/sala/sala.module';
import { TurmaModule } from './modules/turma/turma.module';
import { ContratoModule } from './modules/contrato/contrato.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { MinistraModule } from './modules/ministra/ministra.module';
import { DisponibilidadeProfessorModule } from './modules/disponibilidade-professor/disponibilidade-professor.module';
import { MatriculaModule } from './modules/matricula/matricula.module';
import { AtendimentoModule } from './modules/atendimento/atendimento.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PessoaModule,
    AulaModule,
    CursoModule,
    SalaModule,
    TurmaModule,
    ContratoModule,
    AgendaModule,
    MinistraModule,
    DisponibilidadeProfessorModule,
    MatriculaModule,
    AtendimentoModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

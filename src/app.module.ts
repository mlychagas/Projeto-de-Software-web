import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { AlunoModule } from './modules/aluno/aluno.module';
import { ResponsavelAlunoModule } from './modules/responsavel-aluno/responsavel-aluno.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AlunoModule,
    ResponsavelAlunoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

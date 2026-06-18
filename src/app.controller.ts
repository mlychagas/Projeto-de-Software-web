import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Aluno } from './modules/aluno/aluno.entity';
import { ResponsavelAluno } from './modules/responsavel-aluno/responsavel-aluno.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('inicial')
  getHello(): object {
    // Dados mockados para o Dashboard
    const totalAlunos = 145;
    const aulasHoje = 12;
    const totalCursos = 8;
    const professoresAtivos = 5;

    const proximasAulas = [
      { horario: '14:00', aluno: 'João Silva', instrumento: 'Violão Iniciante', sala: 'Sala 1', status: 'Em andamento' },
      { horario: '15:00', aluno: 'Maria Souza', instrumento: 'Piano Intermediário', sala: 'Sala 3', status: 'Aguardando' },
      { horario: '15:30', aluno: 'Pedro Alves', instrumento: 'Bateria', sala: 'Sala 4', status: 'Aguardando' },
      { horario: '16:00', aluno: 'Ana Beatriz', instrumento: 'Canto', sala: 'Sala 2', status: 'Aguardando' },
    ];

    const graficoPresenca = {
      labels: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
      hoje: [5, 8, 12, 10, 15, 6],
      ontem: [4, 7, 10, 8, 14, 5]
    };

    return {
      titulo: 'Dashboard - Escola de Música',
      horaAgora: new Date().toLocaleString('pt-BR'),
      totalAlunos,
      aulasHoje,
      totalCursos,
      professoresAtivos,
      proximasAulas,
      graficoPresenca: JSON.stringify(graficoPresenca), // Convert to string for JS rendering in the view
    };
  }

  @Get('/escola')
  @Render('escola')
  async getEscola() {
    // Busca a contagem real no banco de dados para os módulos que já temos implementados
    const totalAlunos = await Aluno.count();
    const totalResponsaveis = await ResponsavelAluno.count();

    return {
      titulo: 'Recursos e Configurações da Escola',
      headerType: 'escola',
      totalAlunos,
      totalResponsaveis,
      // Para os outros módulos não implementados, enviamos contagens mockadas/zeradas
      totalTurmas: 5, // Apenas para preencher visualmente, como na imagem
      totalCursos: 8,
      totalSalas: 6,
      totalProfessores: 7,
      totalInstrumentos: 48,
    };
  }
}

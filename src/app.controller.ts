import { Controller, Get, Inject, Render, Query, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { Pessoa, StatusPessoa } from './modules/pessoa/pessoa.entity';
import { Curso } from './modules/curso/curso.entity';
import { Sala } from './modules/sala/sala.entity';
import { Turma } from './modules/turma/turma.entity';
import { Aula, StatusPresenca, StatusAula } from './modules/aula/aula.entity';
import { Ministra } from './modules/ministra/ministra.entity';
import { Agenda } from './modules/agenda/agenda.entity';
import { Contrato } from './modules/contrato/contrato.entity';
import { HistoricoRegistro } from './modules/historico-registro/historico-registro.entity';
import { DisponibilidadeProfessor } from './modules/disponibilidade-professor/disponibilidade-professor.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
  ) {}

  @Get()
  @Render('inicial')
  async getHello(): Promise<object> {
    // --- Métricas reais do banco ---
    const totalAlunos = await this.dataSource.getRepository(Pessoa).count({ where: { isAluno: true } });
    const totalCursos = await this.dataSource.getRepository(Curso).count();
    const professoresAtivos = await this.dataSource.getRepository(Pessoa).count({
      where: { isProfessor: true, statusProf: StatusPessoa.ATIVO },
    });

    // Data de hoje formatada para comparação SQL (YYYY-MM-DD)
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;

    // Contar aulas de hoje
    const aulasHoje = await this.dataSource.getRepository(Aula)
      .createQueryBuilder('a')
      .where('a.data_prevista = :hoje', { hoje: hojeStr })
      .getCount();

    // --- Aulas em andamento e próximas ---
    const horaAtual = `${hoje.getHours().toString().padStart(2, '0')}:${hoje.getMinutes().toString().padStart(2, '0')}:00`;

    // Buscar todas as aulas de hoje com relações
    const aulasDodia = await this.dataSource.getRepository(Aula)
      .createQueryBuilder('aula')
      .leftJoinAndSelect('aula.aluno', 'aluno')
      .leftJoinAndSelect('aula.turma', 'turma')
      .leftJoinAndSelect('turma.curso', 'curso')
      .leftJoinAndSelect('turma.sala', 'sala')
      .where('aula.data_prevista = :hoje', { hoje: hojeStr })
      .orderBy('aula.horario_inicio', 'ASC')
      .getMany();

    // Para cada aula, buscar o professor via Ministra
    const aulasComProfessor: any[] = [];
    for (const aula of aulasDodia) {
      let professorNome = 'Sem Professor';
      if (aula.turma) {
        const ministra = await this.dataSource.getRepository(Ministra).findOne({
          where: { fkTurmaId: aula.turma.id },
          relations: ['professor'],
        });
        if (ministra?.professor) {
          professorNome = ministra.professor.nome;
        }
      }

      // Contar faltas do aluno
      let totalFaltas = 0;
      if (aula.aluno && aula.turma) {
        totalFaltas = await this.dataSource.getRepository(Aula)
          .createQueryBuilder('a')
          .where('a.fk_aluno_id = :alunoId AND a.fk_turma_id = :turmaId', {
            alunoId: aula.aluno.id,
            turmaId: aula.turma.id,
          })
          .andWhere('a.status_presenca_aluno = :status', { status: StatusPresenca.FALTOU })
          .getCount();
      }

      // Contar faturas pendentes/vencidas do aluno
      let faturasAbertas = 0;
      if (aula.aluno) {
        const contratos = await this.dataSource.getRepository(Contrato).find({
          where: { aluno: { id: aula.aluno.id } },
        });
        if (contratos.length > 0) {
          const ids = contratos.map(c => c.id);
          faturasAbertas = await this.dataSource.getRepository('fatura')
            .createQueryBuilder('f')
            .where('f.fk_contrato_id IN (:...ids)', { ids })
            .andWhere('f.status_fatura IN (:...status)', { status: ['Pendente', 'Vencida'] })
            .getCount();
        }
      }

      // Calcular meses até vencimento do contrato
      let vencimentoLabel = '-';
      if (aula.aluno) {
        const contrato = await this.dataSource.getRepository(Contrato).findOne({
          where: { aluno: { id: aula.aluno.id }, statusContrato: 'Ativo' as any },
          order: { dataInicio: 'DESC' },
        });
        if (contrato?.dataFim) {
          const fim = new Date(contrato.dataFim);
          const diffMs = fim.getTime() - hoje.getTime();
          const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDias > 30) {
            vencimentoLabel = `${Math.floor(diffDias / 30)}m`;
          } else if (diffDias > 0) {
            vencimentoLabel = `${diffDias}d`;
          } else {
            vencimentoLabel = 'Venc.';
          }
        }
      }

      aulasComProfessor.push({
        horario: aula.horarioInicio?.substring(0, 5) || '--:--',
        alunoNome: aula.aluno?.nome || 'Sem Aluno',
        professorNome,
        cursoNome: aula.turma?.curso?.instrumento || 'N/A',
        salaNome: aula.turma?.sala?.nome || 'Sem Sala',
        statusPresencaAluno: aula.statusPresencaAluno,
        statusPresencaProfessor: aula.statusPresencaProfessor,
        statusAula: aula.statusAula,
        totalFaltas,
        faturasAbertas,
        vencimentoLabel,
        horarioInicio: aula.horarioInicio || '00:00:00',
        horarioFim: aula.horarioFim || '00:00:00',
      });
    }

    // Separar aulas em andamento e próximas
    const aulasEmAndamento = aulasComProfessor.filter(a => {
      return a.horarioInicio <= horaAtual && a.horarioFim > horaAtual;
    });
    const proximasAulas = aulasComProfessor.filter(a => {
      return a.horarioInicio > horaAtual;
    });

    // --- Métricas dos donuts ---
    // Aulas do dia: realizadas vs total
    const aulasRealizadasHoje = aulasDodia.filter(a => a.statusAula === StatusAula.REALIZADA).length;
    const percentAulasRealizadas = aulasHoje > 0 ? Math.round((aulasRealizadasHoje / aulasHoje) * 100) : 0;

    // Presença hoje
    const presencasHoje = aulasDodia.filter(a => a.statusPresencaAluno === StatusPresenca.PRESENTE).length;
    const percentPresencaHoje = aulasHoje > 0 ? Math.round((presencasHoje / aulasHoje) * 100) : 0;

    // Presença ontem
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = `${ontem.getFullYear()}-${(ontem.getMonth() + 1).toString().padStart(2, '0')}-${ontem.getDate().toString().padStart(2, '0')}`;
    const aulasOntem = await this.dataSource.getRepository(Aula)
      .createQueryBuilder('a')
      .where('a.data_prevista = :ontem', { ontem: ontemStr })
      .getMany();
    const totalAulasOntem = aulasOntem.length;
    const presencasOntem = aulasOntem.filter(a => a.statusPresencaAluno === StatusPresenca.PRESENTE).length;
    const percentPresencaOntem = totalAulasOntem > 0 ? Math.round((presencasOntem / totalAulasOntem) * 100) : 0;

    // Curso com mais matrículas
    const cursoTop = await this.dataSource.getRepository(Contrato)
      .createQueryBuilder('c')
      .select('c.fk_curso_id', 'cursoId')
      .addSelect('COUNT(*)', 'total')
      .groupBy('c.fk_curso_id')
      .orderBy('total', 'DESC')
      .limit(1)
      .getRawOne();
    
    let cursoTopNome = 'Nenhum';
    let cursoTopTotal = 0;
    let cursoTopPercent = 0;
    if (cursoTop) {
      const curso = await this.dataSource.getRepository(Curso).findOne({ where: { id: cursoTop.cursoId } });
      cursoTopNome = curso?.nome || 'N/A';
      cursoTopTotal = parseInt(cursoTop.total, 10);
      const totalContratos = await this.dataSource.getRepository(Contrato).count();
      cursoTopPercent = totalContratos > 0 ? Math.round((cursoTopTotal / totalContratos) * 100) : 0;
    }

    // --- Anotações (últimos registros do histórico) ---
    const anotacoes = await this.dataSource.getRepository(HistoricoRegistro).find({
      order: { dataHora: 'DESC' },
      take: 10,
      relations: ['aluno'],
    });

    return {
      titulo: 'Dashboard - Escola de Música',
      horaAgora: new Date().toLocaleString('pt-BR'),
      totalAlunos,
      aulasHoje,
      totalCursos,
      professoresAtivos,
      aulasEmAndamento,
      proximasAulas,
      // Donuts
      cursoTopNome,
      cursoTopTotal,
      cursoTopPercent,
      aulasRealizadasHoje,
      percentAulasRealizadas,
      presencasHoje,
      percentPresencaHoje,
      totalAulasOntem,
      presencasOntem,
      percentPresencaOntem,
      // Anotações
      anotacoes,
    };
  }

  @Get('/escola')
  @Render('escola')
  async getEscola() {
    // Contagens reais do banco de dados
    const totalAlunos = await this.dataSource.getRepository(Pessoa).count({ where: { isAluno: true } });
    const totalResponsaveis = await this.dataSource.getRepository(Pessoa).count({ where: { isResponsavel: true } });
    const totalTurmas = await this.dataSource.getRepository(Turma).count();
    const totalCursos = await this.dataSource.getRepository(Curso).count();
    const totalSalas = await this.dataSource.getRepository(Sala).count();
    const totalProfessores = await this.dataSource.getRepository(Pessoa).count({
      where: { isProfessor: true, statusProf: StatusPessoa.ATIVO },
    });

    // Instrumentos distintos dos cursos
    const instrumentosResult = await this.dataSource.getRepository(Curso)
      .createQueryBuilder('c')
      .select('COUNT(DISTINCT c.instrumento)', 'total')
      .getRawOne();
    const totalInstrumentos = instrumentosResult ? parseInt(instrumentosResult.total, 10) : 0;

    // Aniversariantes do mês atual
    const mesAtual = hoje().getMonth() + 1;
    const diaAtual = hoje().getDate();
    const aniversariantes = await this.dataSource.getRepository(Pessoa)
      .createQueryBuilder('a')
      .where('a.is_aluno = 1')
      .andWhere('MONTH(a.data_nascimento) = :mes', { mes: mesAtual })
      .andWhere('DAY(a.data_nascimento) = :dia', { dia: diaAtual })
      .getMany();

    return {
      titulo: 'Recursos e Configurações da Escola',
      headerType: 'escola',
      totalAlunos,
      totalResponsaveis,
      totalTurmas,
      totalCursos,
      totalSalas,
      totalProfessores,
      totalInstrumentos,
      aniversariantes,
      totalAniversariantes: aniversariantes.length,
    };
  }

  @Get('/agenda')
  @Render('agenda')
  async getAgenda(
    @Query('date') dateParam?: string,
    @Query('recurso') recursoParam?: string,
    @Query('filtro') filtroParam?: string,
  ) {
    const modoRecurso = recursoParam === 'salas' ? 'salas' : 'professores';
    const modoFiltro = filtroParam === 'todos' ? 'todos' : 'com-aula';

    // Retorna a data solicitada ou atual
    let dataAtual = new Date();
    if (dateParam) {
      const [year, month, day] = dateParam.split('-');
      dataAtual = new Date(Number(year), Number(month) - 1, Number(day));
    }

    // Formatação de data
    const diaMesFormatado = dataAtual
      .toLocaleDateString('pt-BR', { month: 'short' })
      .toUpperCase()
      .replace('.', '');
    const dataFormatada = `${dataAtual.getDate()} DE ${diaMesFormatado}`;

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diaSemanaNome = diasSemana[dataAtual.getDay()];

    // Datas rápidas (ontem, hoje, amanhã)
    const datasRapidas: { dia: string; mes: string; ano: number; fullDate: string }[] = [];
    for (let i = -1; i <= 1; i++) {
      const d = new Date(dataAtual);
      d.setDate(d.getDate() + i);
      datasRapidas.push({
        dia: d.getDate().toString().padStart(2, '0'),
        mes: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
        ano: d.getFullYear(),
        fullDate: d.toISOString().split('T')[0],
      });
    }

    // Mapear dia da semana JS para DiaSemana do banco
    const diasSemanaMap: Record<number, string> = {
      0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
      4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
    };
    const diaSemanaDB = diasSemanaMap[dataAtual.getDay()];

    const dataStr = `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}-${dataAtual.getDate().toString().padStart(2, '0')}`;

    const recursos: any[] = [];

    if (modoRecurso === 'professores') {
      // Buscar professores ativos
      const professores = await this.dataSource.getRepository(Pessoa).find({
        where: { isProfessor: true, statusProf: StatusPessoa.ATIVO },
        order: { nome: 'ASC' },
      });

      for (const prof of professores) {
        // Buscar disponibilidade do professor para calcular turno
        const disponibilidades = await this.dataSource.getRepository(DisponibilidadeProfessor).find({
          where: { professor: { id: prof.id } },
        });

        // Calcular início e fim do turno a partir das disponibilidades
        let inicioTurno = 8;
        let fimTurno = 22;
        if (disponibilidades.length > 0) {
          const horas = disponibilidades.map(d => parseInt(d.horarioInicio.split(':')[0], 10));
          const horasFim = disponibilidades.map(d => parseInt(d.horarioFim.split(':')[0], 10));
          inicioTurno = Math.min(...horas);
          fimTurno = Math.max(...horasFim);
        }

        // Buscar turmas do professor que ocorrem no dia da semana selecionado
        const ministras = await this.dataSource.getRepository(Ministra).find({
          where: { fkProfessorId: prof.id },
          relations: ['turma', 'turma.sala', 'turma.curso'],
        });

        const turmasNoDia = ministras
          .filter(m => m.turma && m.turma.diaSemana === diaSemanaDB)
          .map(m => m.turma);

        // Para cada turma no dia, buscar aulas agendadas
        const aulas: any[] = [];
        for (const turma of turmasNoDia) {
          // Buscar aulas desta turma na data selecionada
          const aulasDodia = await this.dataSource.getRepository(Aula)
            .createQueryBuilder('aula')
            .leftJoinAndSelect('aula.aluno', 'aluno')
            .where('aula.fk_turma_id = :turmaId', { turmaId: turma.id })
            .andWhere('aula.data_prevista = :data', { data: dataStr })
            .getMany();

          if (aulasDodia.length > 0) {
            for (const aula of aulasDodia) {
              const horaInicio = parseInt(turma.horarioInicio.split(':')[0], 10);
              aulas.push({
                hora: horaInicio,
                tituloCard: aula.aluno?.nome || 'Aluno',
                subtituloCard: turma.sala?.nome || 'Sem Sala',
                cor: this.determinarCorEvento(aula),
                badge: this.determinarBadge(aula),
              });
            }
          } else {
            // Se a turma tem aula neste dia da semana mas não tem registros de aula,
            // mostrar os alunos agendados nessa turma
            const agendamentos = await this.dataSource.getRepository(Agenda).find({
              where: { fkTurmaId: turma.id, statusAgenda: 'Matriculado' as any },
              relations: ['aluno'],
            });
            for (const ag of agendamentos) {
              const horaInicio = parseInt(turma.horarioInicio.split(':')[0], 10);
              aulas.push({
                hora: horaInicio,
                tituloCard: ag.aluno?.nome || 'Aluno',
                subtituloCard: turma.sala?.nome || 'Sem Sala',
                cor: 'event-blue',
                badge: null,
              });
            }
          }
        }

        recursos.push({
          id: prof.id,
          nome: prof.nome,
          subtitulo: prof.especialidade,
          inicioTurno,
          fimTurno,
          aulas,
        });
      }
    } else {
      // Modo Salas
      const salas = await this.dataSource.getRepository(Sala).find({
        order: { nome: 'ASC' },
      });

      for (const sala of salas) {
        // Buscar turmas vinculadas a esta sala no dia da semana
        const turmasNaSala = await this.dataSource.getRepository(Turma).find({
          where: { sala: { id: sala.id }, diaSemana: diaSemanaDB as any },
          relations: ['curso'],
        });

        const aulas: any[] = [];
        for (const turma of turmasNaSala) {
          // Buscar o professor da turma
          const ministra = await this.dataSource.getRepository(Ministra).findOne({
            where: { fkTurmaId: turma.id },
            relations: ['professor'],
          });
          const profNome = ministra?.professor?.nome || 'Sem Prof.';

          // Buscar aulas na data
          const aulasDodia = await this.dataSource.getRepository(Aula)
            .createQueryBuilder('aula')
            .leftJoinAndSelect('aula.aluno', 'aluno')
            .where('aula.fk_turma_id = :turmaId', { turmaId: turma.id })
            .andWhere('aula.data_prevista = :data', { data: dataStr })
            .getMany();

          if (aulasDodia.length > 0) {
            for (const aula of aulasDodia) {
              const horaInicio = parseInt(turma.horarioInicio.split(':')[0], 10);
              aulas.push({
                hora: horaInicio,
                tituloCard: aula.aluno?.nome || 'Aluno',
                subtituloCard: profNome,
                cor: this.determinarCorEvento(aula),
                badge: this.determinarBadge(aula),
              });
            }
          } else {
            // Mostrar agendamentos
            const agendamentos = await this.dataSource.getRepository(Agenda).find({
              where: { fkTurmaId: turma.id, statusAgenda: 'Matriculado' as any },
              relations: ['aluno'],
            });
            for (const ag of agendamentos) {
              const horaInicio = parseInt(turma.horarioInicio.split(':')[0], 10);
              aulas.push({
                hora: horaInicio,
                tituloCard: ag.aluno?.nome || 'Aluno',
                subtituloCard: profNome,
                cor: 'event-blue',
                badge: null,
              });
            }
          }
        }

        recursos.push({
          id: sala.id,
          nome: sala.nome,
          subtitulo: `Capacidade ${sala.capacidade}`,
          inicioTurno: 8,
          fimTurno: 22,
          aulas,
        });
      }
    }

    // Aplica o filtro de "Com aula"
    let recursosFiltrados = recursos;
    if (modoFiltro === 'com-aula') {
      recursosFiltrados = recursos.filter(r => r.aulas && r.aulas.length > 0);
    }

    return {
      titulo: 'Agenda - Sistema de Gestão',
      headerType: 'agenda',
      dataAtualCompleta: `${dataFormatada} ${diaSemanaNome}`,
      datasRapidas,
      dataInput: `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}-${dataAtual.getDate().toString().padStart(2, '0')}`,
      recursos: recursosFiltrados,
      modoRecurso,
      modoFiltro,
    };
  }

  // Determinar cor do evento com base no status real da aula
  private determinarCorEvento(aula: Aula): string {
    const now = new Date();
    const aulaDia = new Date(aula.dataPrevista);
    const horaInicio = parseInt((aula.horarioInicio || '00').split(':')[0], 10);
    const aulaTime = new Date(aulaDia);
    aulaTime.setHours(horaInicio, 0, 0, 0);
    const diffHours = (aulaTime.getTime() - now.getTime()) / 3600000;

    // Aula no futuro (mais de 1h)
    if (diffHours > 1) return 'event-blue';
    // Aula próxima (menos de 1h)
    if (diffHours > 0 && diffHours <= 1) return 'event-yellow';

    // Aula passada ou em andamento — verificar presença
    if (aula.statusAula === StatusAula.CANCELADA) return 'event-red';
    if (aula.statusPresencaAluno === StatusPresenca.PRESENTE &&
        aula.statusPresencaProfessor === StatusPresenca.PRESENTE) {
      return 'event-green';
    }
    if (aula.statusPresencaAluno === StatusPresenca.FALTOU) return 'event-red';
    if (aula.statusPresencaProfessor === StatusPresenca.PRESENTE &&
        aula.statusPresencaAluno !== StatusPresenca.PRESENTE) {
      return 'event-purple';
    }
    return 'event-yellow';
  }

  // Determinar badge do evento
  private determinarBadge(aula: Aula): string | null {
    if (aula.reagendado) return 'R';
    return null;
  }

  @Get('/api/busca-pessoas')
  async buscarPessoas(@Query('q') termo?: string) {
    if (!termo || termo.trim().length < 2) {
      return [];
    }

    const termoLike = `%${termo.trim()}%`;

    const pessoas = await this.dataSource.getRepository(Pessoa)
      .createQueryBuilder('p')
      .where('p.nome LIKE :termo', { termo: termoLike })
      .orderBy('p.nome', 'ASC')
      .take(15)
      .getMany();

    const resultados: any[] = [];
    pessoas.forEach(p => {
      let tipo = '';
      let icone = '';
      let cor = '';
      let detalhe = p.email || p.telefone || '';

      if (p.isAluno) { tipo = 'Aluno'; icone = 'mdi-account'; cor = '#6c5ce7'; }
      else if (p.isProfessor) { tipo = 'Professor'; icone = 'mdi-account-tie'; cor = '#00b894'; }
      else if (p.isResponsavel) { tipo = 'Responsável'; icone = 'mdi-account-group'; cor = '#fdcb6e'; }
      else { tipo = 'Pessoa'; icone = 'mdi-account-circle'; cor = '#aaa'; }

      resultados.push({
        tipo, icone, cor, nome: p.nome, detalhe,
        status: p.statusAluno || p.statusProf || '',
        url: `/pessoas/${p.id}/perfil`,
      });
    });

    // Ordenar por relevância (nome que começa com o termo primeiro)
    const termoLower = termo.trim().toLowerCase();
    resultados.sort((a, b) => {
      const aStarts = a.nome.toLowerCase().startsWith(termoLower) ? 0 : 1;
      const bStarts = b.nome.toLowerCase().startsWith(termoLower) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.nome.localeCompare(b.nome);
    });

    return resultados.slice(0, 15);
  }
}

// Helper para obter data atual
function hoje(): Date {
  return new Date();
}

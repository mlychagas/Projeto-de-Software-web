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
    const diasSemanaMap: Record<number, string> = {
      0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
      4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
    };
    const diaSemanaDB = diasSemanaMap[hoje.getDay()];

    const aulasComProfessor = await this.obterAulasDoDia(hoje, diaSemanaDB);
    const horaAtual = `${hoje.getHours().toString().padStart(2, '0')}:${hoje.getMinutes().toString().padStart(2, '0')}:00`;

    // Separar aulas em andamento e próximas
    const aulasEmAndamento = aulasComProfessor.filter(a => {
      return a.horarioInicio <= horaAtual && a.horarioFim > horaAtual;
    });
    const proximasAulas = aulasComProfessor.filter(a => {
      return a.horarioInicio > horaAtual;
    });

    // --- Métricas dos donuts ---
    // Recarregar apenas aulas do dia explícitas para cálculo de % real
    const aulasDodia = await this.dataSource.getRepository(Aula)
      .createQueryBuilder('aula')
      .where('aula.data_prevista = :hoje', { hoje: hojeStr })
      .getMany();

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
      relations: ['pessoa'],
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

  @Get('/api/clean-aulas')
  async cleanAulas() {
    // Busca aulas que não tem agenda ativa
    const aulas = await this.dataSource.getRepository(Aula).find({
      relations: ['aluno', 'turma']
    });
    let limpadas = 0;
    for (const aula of aulas) {
      if (aula.aluno && aula.turma) {
        const agenda = await this.dataSource.getRepository(Agenda).findOne({
          where: { fkAlunoId: aula.aluno.id, fkTurmaId: aula.turma.id }
        });
        if (!agenda || agenda.statusAgenda === 'Cancelado' as any) {
          aula.statusAula = StatusAula.CANCELADA;
          await aula.save();
          limpadas++;
        }
      }
    }
    return { message: `Limpeza concluída. ${limpadas} aulas canceladas.` };
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
    const todasAsAulasDoDia = await this.obterAulasDoDia(dataAtual, diaSemanaDB);

    const recursos: any[] = [];

    if (modoRecurso === 'professores') {
      const professores = await this.dataSource.getRepository(Pessoa).find({
        where: { isProfessor: true, statusProf: StatusPessoa.ATIVO },
        order: { nome: 'ASC' },
      });

      for (const prof of professores) {
        const disponibilidades = await this.dataSource.getRepository(DisponibilidadeProfessor).find({
          where: { professor: { id: prof.id } },
        });

        let inicioTurno = 8;
        let fimTurno = 22;
        if (disponibilidades.length > 0) {
          const horas = disponibilidades.map(d => parseInt(d.horarioInicio.split(':')[0], 10));
          const horasFim = disponibilidades.map(d => parseInt(d.horarioFim.split(':')[0], 10));
          inicioTurno = Math.min(...horas);
          fimTurno = Math.max(...horasFim);
        }

        const aulasDoProfessor = todasAsAulasDoDia.filter(a => a.profId === prof.id).map(a => ({
          hora: parseInt(a.horarioInicio.split(':')[0], 10),
          tituloCard: a.alunoNome,
          subtituloCard: a.salaNome,
          cor: a.cor,
          badge: a.badge,
          alunoId: a.alunoId,
        }));

        recursos.push({
          id: prof.id,
          nome: prof.nome,
          subtitulo: prof.especialidade,
          inicioTurno,
          fimTurno,
          aulas: aulasDoProfessor,
        });
      }
    } else {
      const salas = await this.dataSource.getRepository(Sala).find({
        order: { nome: 'ASC' },
      });

      for (const sala of salas) {
        const aulasDaSala = todasAsAulasDoDia.filter(a => a.salaId === sala.id).map(a => ({
          hora: parseInt(a.horarioInicio.split(':')[0], 10),
          tituloCard: a.alunoNome,
          subtituloCard: a.professorNome,
          cor: a.cor,
          badge: a.badge,
          alunoId: a.alunoId,
        }));

        recursos.push({
          id: sala.id,
          nome: sala.nome,
          subtitulo: `Capacidade ${sala.capacidade}`,
          inicioTurno: 8,
          fimTurno: 22,
          aulas: aulasDaSala,
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
  private determinarCorEvento(aula: Aula | any): string {
    if (aula.isPrevista) return 'event-blue'; // Aulas regulares (sem registro Aula)

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
  private determinarBadge(aula: Aula | any): string | null {
    if (aula.isPrevista) return null;
    if (aula.reagendado) return 'R';
    return null;
  }

  // Helper para obter as aulas e sincronizar Dashboard e Agenda
  private async obterAulasDoDia(dataAtual: Date, diaSemanaDB: string): Promise<any[]> {
    const dataStr = `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}-${dataAtual.getDate().toString().padStart(2, '0')}`;
    
    // 1. Buscar todas as Aulas salvas para essa data
    const aulasSalvas = await this.dataSource.getRepository(Aula)
      .createQueryBuilder('aula')
      .leftJoinAndSelect('aula.aluno', 'aluno')
      .leftJoinAndSelect('aula.turma', 'turma')
      .leftJoinAndSelect('turma.curso', 'curso')
      .leftJoinAndSelect('turma.sala', 'sala')
      .leftJoin(Agenda, 'ag', 'ag.fk_turma_id = turma.id AND ag.fk_aluno_id = aluno.id')
      .where('aula.data_prevista = :data', { data: dataStr })
      .andWhere('aula.status_aula != :statusCanc', { statusCanc: StatusAula.CANCELADA })
      .andWhere('(ag.fk_aluno_id IS NULL OR ag.status_agenda = :statusMatriculado)', { statusMatriculado: 'Matriculado' })
      .orderBy('aula.horario_inicio', 'ASC')
      .getMany();

    // 2. Buscar todas as turmas que ocorrem neste dia da semana
    const turmasRegulares = await this.dataSource.getRepository(Turma)
      .createQueryBuilder('turma')
      .leftJoinAndSelect('turma.curso', 'curso')
      .leftJoinAndSelect('turma.sala', 'sala')
      .where('turma.dia_semana = :dia', { dia: diaSemanaDB })
      .getMany();

    const aulasConsolidadas: any[] = [];
    const aulasSalvasMap = new Set<string>();

    for (const aula of aulasSalvas) {
      if (aula.turma) aulasSalvasMap.add(`${aula.turma.id}-${aula.aluno?.id}`);
      
      const ministra = aula.turma ? await this.dataSource.getRepository(Ministra).findOne({
        where: { fkTurmaId: aula.turma.id },
        relations: ['professor'],
      }) : null;
      
      const prof = ministra?.professor;

      aulasConsolidadas.push({
        isPrevista: false,
        id: aula.id,
        turmaId: aula.turma?.id,
        salaId: aula.turma?.sala?.id,
        profId: prof?.id,
        alunoId: aula.aluno?.id,
        horario: aula.horarioInicio?.substring(0, 5) || '--:--',
        alunoNome: aula.aluno?.nome || 'Sem Aluno',
        professorNome: prof?.nome || 'Sem Professor',
        cursoNome: aula.turma?.curso?.instrumento || 'N/A',
        salaNome: aula.turma?.sala?.nome || 'Sem Sala',
        statusPresencaAluno: aula.statusPresencaAluno,
        statusPresencaProfessor: aula.statusPresencaProfessor,
        statusAula: aula.statusAula,
        horarioInicio: aula.horarioInicio || '00:00:00',
        horarioFim: aula.horarioFim || '00:00:00',
        dataPrevista: aula.dataPrevista,
        cor: this.determinarCorEvento(aula),
        badge: this.determinarBadge(aula),
        totalFaltas: 0, // Poderia ser computado
        faturasAbertas: 0,
        vencimentoLabel: '-'
      });
    }

    // 3. Adicionar aulas regulares que não foram instanciadas (previstas)
    for (const turma of turmasRegulares) {
      const agendamentos = await this.dataSource.getRepository(Agenda).find({
        where: { fkTurmaId: turma.id, statusAgenda: 'Matriculado' as any },
        relations: ['aluno'],
      });

      const ministra = await this.dataSource.getRepository(Ministra).findOne({
        where: { fkTurmaId: turma.id },
        relations: ['professor'],
      });
      const prof = ministra?.professor;

      for (const ag of agendamentos) {
        const chave = `${turma.id}-${ag.aluno?.id}`;
        if (!aulasSalvasMap.has(chave)) {
           aulasConsolidadas.push({
            isPrevista: true,
            id: `prev-${ag.fkAlunoId}-${ag.fkTurmaId}`,
            turmaId: turma.id,
            salaId: turma.sala?.id,
            profId: prof?.id,
            alunoId: ag.aluno?.id,
            horario: turma.horarioInicio?.substring(0, 5) || '--:--',
            alunoNome: ag.aluno?.nome || 'Sem Aluno',
            professorNome: prof?.nome || 'Sem Professor',
            cursoNome: turma.curso?.instrumento || 'N/A',
            salaNome: turma.sala?.nome || 'Sem Sala',
            statusPresencaAluno: null,
            statusPresencaProfessor: null,
            statusAula: null,
            horarioInicio: turma.horarioInicio || '00:00:00',
            horarioFim: turma.horarioFim || '00:00:00',
            dataPrevista: dataStr,
            cor: 'event-blue',
            badge: null,
            totalFaltas: 0,
            faturasAbertas: 0,
            vencimentoLabel: '-'
           });
        }
      }
    }

    // 4. Calcular métricas secundárias do Dashboard apenas se necessário (otimização)
    // Para economizar queries, deixaremos as métricas extras simplificadas nesta versão
    
    return aulasConsolidadas.sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
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

import { Controller, Get, Param, Render, Post, Body, Inject } from '@nestjs/common';
import { Curso } from '../curso/curso.entity';
import { Pessoa, StatusPessoa } from '../pessoa/pessoa.entity';
import { Ministra } from '../ministra/ministra.entity';
import { Agenda, StatusAgenda } from '../agenda/agenda.entity';
import { Turma } from '../turma/turma.entity';
import { Contrato, StatusContrato } from '../contrato/contrato.entity';
import { DataSource } from 'typeorm';

@Controller('matricula')
export class MatriculaController {
  
  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {}

  @Get('agendamento')
  @Render('matricula/selecionar-horario')
  async selecionarHorario(@Query('pessoa') pessoaId?: string) {
    const cursos = await Curso.find({ order: { nome: 'ASC' } });
    const professores = await Pessoa.find({ where: { isProfessor: true, statusProf: StatusPessoa.ATIVO }, order: { nome: 'ASC' } });
    let pessoa = null;
    if (pessoaId) {
      pessoa = await Pessoa.findOne({ where: { id: parseInt(pessoaId, 10) } });
    }
    return { title: 'Agendamento / Disponibilidade', cursos, professores, pessoa };
  }

  @Get('api/agenda-professor/:id')
  async getAgendaProfessor(@Param('id') id: number) {
    const ministras = await Ministra.find({
      where: { fkProfessorId: id },
      relations: ['turma', 'turma.sala']
    });

    const turmasDoProfessor = ministras.map(m => m.turma).filter(t => t != null);

    const turmasComAlunos = await Promise.all(turmasDoProfessor.map(async turma => {
      const agendamentos = await Agenda.count({ where: { fkTurmaId: turma.id } });
      return {
        id: turma.id,
        nome: turma.nome,
        diaSemana: turma.diaSemana,
        horarioInicio: turma.horarioInicio,
        horarioFim: turma.horarioFim,
        sala: turma.sala ? turma.sala.nome : 'Sem Sala',
        capacidade: turma.capacidade,
        alunosMatriculados: agendamentos
      };
    }));

    return turmasComAlunos;
  }

  @Get('nova')
  @Render('matricula/nova')
  async novaMatricula(
    @Query('pessoa') pessoaId?: string, 
    @Query('turma') turmaId?: string, 
    @Query('curso') cursoId?: string,
    @Query('prof') profId?: string,
    @Query('dia') dia?: string,
    @Query('hora') hora?: string,
    @Query('sala') sala?: string
  ) {
    const cursos = await Curso.find({ order: { nome: 'ASC' } });
    let pessoa = null;
    if (pessoaId) {
      pessoa = await Pessoa.findOne({ where: { id: parseInt(pessoaId, 10) } });
    }
    let turma = null;
    if (turmaId) {
      turma = await Turma.findOne({ where: { id: parseInt(turmaId, 10) }, relations: ['curso', 'sala'] });
    }
    let professor = null;
    if (profId) {
      professor = await Pessoa.findOne({ where: { id: parseInt(profId, 10), isProfessor: true } });
    }
    return { title: 'Nova Matrícula', cursos, pessoa, turma, cursoIdSelecionado: cursoId, professor, dia, hora, sala };
  }

  @Get('cadastro')
  @Render('matricula/cadastro')
  cadastro() {
    return { title: 'Cadastro de Matrícula' };
  }

  @Post('api/salvar')
  async salvarMatricula(@Body() payload: any) {
    // 1. Iniciar Transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Tratar Aluno
      let aluno = await queryRunner.manager.findOne(Pessoa, { where: { cpf: payload.aluno.cpf, isAluno: true } });
      
      if (!aluno) {
        aluno = new Pessoa();
        aluno.nome = payload.aluno.nome;
        aluno.cpf = payload.aluno.cpf;
        aluno.rg = payload.aluno.rg;
        aluno.email = payload.aluno.email;
        aluno.telefone = payload.aluno.telefone;
        aluno.dataNascimento = new Date(payload.aluno.dataNascimento);
        aluno.isAluno = true;
        aluno.dataMatricula = new Date();
        aluno.statusAluno = StatusPessoa.ATIVO;
        aluno = await queryRunner.manager.save(aluno);
      }

      // 3. Tratar Contrato
      const curso = await queryRunner.manager.findOne(Curso, { where: { id: payload.financeiro.cursoId } });
      if (!curso) throw new Error('Curso não encontrado');

      const contrato = new Contrato();
      contrato.aluno = aluno;
      contrato.curso = curso;
      contrato.dataInicio = new Date();
      contrato.valorMensal = payload.financeiro.valorLiquido;
      
      const hoje = new Date();
      const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), payload.financeiro.diaVencimento);
      if (vencimento < hoje) {
        vencimento.setMonth(vencimento.getMonth() + 1);
      }
      contrato.dataVencimentoParcela = vencimento;
      contrato.statusContrato = StatusContrato.ATIVO;
      await queryRunner.manager.save(contrato);

      // 4. Tratar Agenda
      if (payload.agendamento && payload.agendamento.turmaId) {
        const turma = await queryRunner.manager.findOne(Turma, { where: { id: payload.agendamento.turmaId } });
        if (turma) {
          const agenda = new Agenda();
          agenda.fkAlunoId = aluno.id;
          agenda.fkTurmaId = turma.id;
          agenda.aluno = aluno;
          agenda.turma = turma;
          agenda.frequencia = 1; 
          agenda.statusAgenda = StatusAgenda.MATRICULADO;
          agenda.dataInscricao = new Date();
          await queryRunner.manager.save(agenda);
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Matrícula salva com sucesso!', alunoId: aluno.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao salvar matrícula:', error);
      return { success: false, message: error.message || 'Erro interno ao salvar matrícula.' };
    } finally {
      await queryRunner.release();
    }
  }

}

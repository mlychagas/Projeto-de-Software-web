import { Controller, Get, Param, Render, Post, Body, Inject, Query } from '@nestjs/common';
import { Curso } from '../curso/curso.entity';
import { Pessoa, StatusPessoa } from '../pessoa/pessoa.entity';
import { Ministra } from '../ministra/ministra.entity';
import { Agenda, StatusAgenda } from '../agenda/agenda.entity';
import { Turma } from '../turma/turma.entity';
import { Contrato, StatusContrato } from '../contrato/contrato.entity';
import { Fatura, StatusFatura } from '../fatura/fatura.entity';
import { Sala } from '../sala/sala.entity';
import { Aula, StatusAula } from '../aula/aula.entity';
import { DataSource } from 'typeorm';

@Controller('matricula')
export class MatriculaController {
  
  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {}

  @Get('agendamento')
  @Render('matricula/selecionar-horario')
  async selecionarHorario(@Query('pessoa') pessoaId?: string) {
    const cursos = await Curso.find({ order: { nome: 'ASC' } });
    const professores = await Pessoa.find({ where: { isProfessor: true, statusProf: StatusPessoa.ATIVO }, order: { nome: 'ASC' } });
    let pessoa: Pessoa | null = null;
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
    @Query('sala') sala?: string,
    @Query('alterar') alterar?: string,
    @Query('turmaAntiga') turmaAntiga?: string
  ) {
    const cursos = await Curso.find({ order: { nome: 'ASC' } });
    let pessoa: Pessoa | null = null;
    if (pessoaId) {
      pessoa = await Pessoa.findOne({ where: { id: parseInt(pessoaId, 10) } });
    }
    let turma: Turma | null = null;
    if (turmaId) {
      turma = await Turma.findOne({ where: { id: parseInt(turmaId, 10) }, relations: ['curso', 'sala'] });
    }
    let professor: Pessoa | null = null;
    if (profId) {
      professor = await Pessoa.findOne({ where: { id: parseInt(profId, 10), isProfessor: true } });
    }
    
    // Auto-fill dia, hora, sala and professor from turma if not passed via query
    let viewDia = dia;
    let viewHora = hora;
    let viewSala = sala;
    if (turma) {
      if (!viewDia) viewDia = turma.diaSemana;
      if (!viewHora) viewHora = turma.horarioInicio;
      if (!viewSala && turma.sala) viewSala = turma.sala.nome;
      
      if (!professor) {
        const ministra = await Ministra.findOne({ where: { fkTurmaId: turma.id }, relations: ['professor'] });
        if (ministra && ministra.professor) {
          professor = ministra.professor;
        }
      }
    }

    let contratoExistente: Contrato | null = null;
    let isAlteracao = false;
    if (alterar === 'true' && pessoa) {
      isAlteracao = true;
      const cId = cursoId || turma?.curso?.id;
      if (cId) {
        contratoExistente = await Contrato.findOne({
          where: { aluno: { id: pessoa.id }, curso: { id: parseInt(cId as any) }, statusContrato: StatusContrato.ATIVO }
        });
      }
    }

    return { 
      title: isAlteracao ? 'Alterar Matrícula' : 'Nova Matrícula', 
      cursos, pessoa, turma, 
      cursoIdSelecionado: cursoId || (turma?.curso?.id), 
      professor, dia: viewDia, hora: viewHora, sala: viewSala, 
      isAlteracao, contratoExistente, turmaAntiga 
    };
  }

  @Get('cadastro')
  @Render('matricula/cadastro')
  async cadastro(@Query('aluno') alunoId?: string) {
    let aluno: Pessoa | null = null;
    if (alunoId) {
      aluno = await Pessoa.findOne({ where: { id: parseInt(alunoId, 10) } });
    }
    return { title: 'Cadastro de Matrícula', aluno };
  }

  @Post('api/cadastro-finalizar')
  async finalizarCadastro(@Body() payload: any) {
    const { alunoId, responsavel } = payload;
    
    try {
      let aluno = await Pessoa.findOne({ where: { id: parseInt(alunoId, 10) } });
      if (!aluno) throw new Error('Aluno não encontrado');

      // Se o aluno for o próprio responsável (ou menor de idade com outro responsavel)
      // Por simplicidade, vamos atualizar os dados de endereço no aluno por enquanto
      // e atualizar seus dados pessoais
      aluno.nome = responsavel.nome;
      if (responsavel.cpf) aluno.cpf = responsavel.cpf;
      if (responsavel.rg) aluno.rg = responsavel.rg;
      if (responsavel.email) aluno.email = responsavel.email;
      if (responsavel.telefone) aluno.telefone = responsavel.telefone;
      if (responsavel.dataNascimento) aluno.dataNascimento = new Date(responsavel.dataNascimento);
      if (responsavel.pronome) aluno.pronome = responsavel.pronome;

      // Endereço
      aluno.cep = responsavel.cep;
      aluno.logradouro = responsavel.logradouro;
      aluno.numero = responsavel.numero;
      aluno.complemento = responsavel.complemento;
      aluno.bairro = responsavel.bairro;
      aluno.cidade = responsavel.cidade;
      aluno.estado = responsavel.estado;

      await aluno.save();

      return { success: true, message: 'Cadastro finalizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao finalizar cadastro:', error);
      return { success: false, message: error.message || 'Erro interno ao salvar.' };
    }
  }

  @Post('api/salvar')
  async salvarMatricula(@Body() payload: any) {
    // 1. Iniciar Transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Tratar Aluno
      let aluno: Pessoa | null = null;
      if (payload.aluno.id) {
        aluno = await queryRunner.manager.findOne(Pessoa, { where: { id: payload.aluno.id } });
        if (aluno && !aluno.isAluno) {
          aluno.isAluno = true;
          if (!aluno.statusAluno) aluno.statusAluno = StatusPessoa.ATIVO;
          if (!aluno.dataMatricula) aluno.dataMatricula = new Date();
          aluno = await queryRunner.manager.save(aluno);
        }
      } else {
        aluno = await queryRunner.manager.findOne(Pessoa, { where: { cpf: payload.aluno.cpf, isAluno: true } });
      }
      
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

      const numParcelas = curso.duracaoMeses || 12;
      for (let i = 0; i < numParcelas; i++) {
        const fatura = new Fatura();
        fatura.contrato = contrato;
        const dtVenc = new Date(vencimento);
        dtVenc.setMonth(dtVenc.getMonth() + i);
        fatura.dataVencimento = dtVenc;
        fatura.valorDevido = contrato.valorMensal;
        fatura.statusFatura = StatusFatura.PENDENTE;
        fatura.descricao = `Mensalidade Curso ${curso.nome} - Parcela ${i + 1}/${numParcelas}`;
        await queryRunner.manager.save(fatura);
      }

      // 4. Tratar Agenda
      let turmaParaAgendar: Turma | null = null;
      if (payload.agendamento && payload.agendamento.turmaId) {
        turmaParaAgendar = await queryRunner.manager.findOne(Turma, { where: { id: payload.agendamento.turmaId } });
      } else if (payload.agendamento && payload.agendamento.dia && payload.agendamento.hora) {
        // Criar uma nova turma
        turmaParaAgendar = new Turma();
        turmaParaAgendar.nome = `Turma - ${aluno.nome}`;
        turmaParaAgendar.diaSemana = payload.agendamento.dia.replace('-feira', '') as any;
        turmaParaAgendar.horarioInicio = payload.agendamento.hora;
        turmaParaAgendar.horarioFim = `${String(parseInt(payload.agendamento.hora.split(':')[0], 10) + 1).padStart(2, '0')}:00`;
        turmaParaAgendar.capacidade = 1;
        turmaParaAgendar.dataInicio = new Date();
        turmaParaAgendar.curso = curso;
        
        if (payload.agendamento.sala) {
          const salaDb = await queryRunner.manager.findOne(Sala, { where: { nome: payload.agendamento.sala } });
          if (salaDb) turmaParaAgendar.sala = salaDb;
        }
        await queryRunner.manager.save(turmaParaAgendar);

        if (payload.agendamento.profId) {
          const ministra = new Ministra();
          ministra.turma = turmaParaAgendar;
          ministra.fkTurmaId = turmaParaAgendar.id;
          ministra.fkProfessorId = payload.agendamento.profId;
          ministra.dataAtribuicao = new Date();
          const professor = await queryRunner.manager.findOne(Pessoa, { where: { id: payload.agendamento.profId } });
          if (professor) ministra.professor = professor;
          await queryRunner.manager.save(ministra);
        }
      }

      if (turmaParaAgendar) {
        const agenda = new Agenda();
        agenda.fkAlunoId = aluno.id;
        agenda.fkTurmaId = turmaParaAgendar.id;
        agenda.aluno = aluno;
        agenda.turma = turmaParaAgendar;
        agenda.frequencia = 1; 
        agenda.statusAgenda = StatusAgenda.MATRICULADO;
        agenda.dataInscricao = new Date();
        await queryRunner.manager.save(agenda);
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

  @Get('api/contrato/:id/faturas')
  async getFaturasContrato(@Param('id') contratoId: number) {
    return await Fatura.find({ where: { contrato: { id: contratoId } }, order: { dataVencimento: 'ASC' } });
  }

  @Post('api/cancelar')
  async cancelarMatricula(@Body() payload: { alunoId: number, turmaId: number, contratoId: number, ultimaFaturaId: number, motivo: string, dataUltimaAula?: string }) {
    const { alunoId, turmaId, contratoId, ultimaFaturaId, motivo, dataUltimaAula } = payload;
    
    // Soft-delete Agenda
    const agenda = await Agenda.findOne({ where: { fkAlunoId: alunoId, fkTurmaId: turmaId } });
    if (agenda) {
      agenda.statusAgenda = StatusAgenda.CANCELADO;
      agenda.dataCancelamento = new Date();
      await agenda.save();
    }
    
    // Soft-delete future Aulas
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
    const dataLimite = dataUltimaAula || hojeStr;
    await this.dataSource.createQueryBuilder()
      .update(Aula)
      .set({ statusAula: StatusAula.CANCELADA })
      .where('fk_aluno_id = :alunoId AND fk_turma_id = :turmaId AND data_prevista > :dataLimite', { alunoId, turmaId, dataLimite })
      .execute();

    // Cancel Contrato
    const contrato = await Contrato.findOne({ where: { id: contratoId } });
    if (contrato) {
      contrato.statusContrato = StatusContrato.CANCELADO;
      contrato.dataFim = new Date();
      await contrato.save();
    }
    
    // Handle faturas
    if (ultimaFaturaId) {
      const ultimaFatura = await Fatura.findOne({ where: { id: ultimaFaturaId } });
      if (ultimaFatura) {
        await this.dataSource.createQueryBuilder()
          .delete()
          .from(Fatura)
          .where('fk_contrato_id = :contratoId', { contratoId })
          .andWhere('data_vencimento > :data', { data: ultimaFatura.dataVencimento })
          .execute();
      }
    } else {
        await this.dataSource.createQueryBuilder()
          .delete()
          .from(Fatura)
          .where('fk_contrato_id = :contratoId', { contratoId })
          .andWhere('status_fatura = :status', { status: StatusFatura.PENDENTE })
          .execute();
    }
    
    return { success: true };
  }

  @Post('api/alterar')
  async alterarMatricula(@Body() payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const aluno = await queryRunner.manager.findOne(Pessoa, { where: { id: payload.aluno.id } });
      if (!aluno) throw new Error('Aluno não encontrado');

      // Update Agenda
      let novaTurma: Turma | null = null;
      if (payload.agendamento && payload.agendamento.turmaId) {
        novaTurma = await queryRunner.manager.findOne(Turma, { where: { id: payload.agendamento.turmaId } });
      } else if (payload.agendamento && payload.agendamento.dia && payload.agendamento.hora) {
        novaTurma = new Turma();
        novaTurma.nome = `Turma - ${aluno.nome}`;
        novaTurma.diaSemana = payload.agendamento.dia.replace('-feira', '') as any;
        novaTurma.horarioInicio = payload.agendamento.hora;
        novaTurma.horarioFim = `${String(parseInt(payload.agendamento.hora.split(':')[0], 10) + 1).padStart(2, '0')}:00`;
        novaTurma.capacidade = 1;
        novaTurma.dataInicio = new Date();
        const curso = await queryRunner.manager.findOne(Curso, { where: { id: payload.financeiro.cursoId } });
        if (curso) novaTurma.curso = curso;
        
        if (payload.agendamento.sala) {
          const salaDb = await queryRunner.manager.findOne(Sala, { where: { nome: payload.agendamento.sala } });
          if (salaDb) novaTurma.sala = salaDb;
        }
        await queryRunner.manager.save(novaTurma);

        if (payload.agendamento.profId) {
          const ministra = new Ministra();
          ministra.turma = novaTurma;
          ministra.fkTurmaId = novaTurma.id;
          ministra.fkProfessorId = payload.agendamento.profId;
          ministra.dataAtribuicao = new Date();
          const professor = await queryRunner.manager.findOne(Pessoa, { where: { id: payload.agendamento.profId } });
          if (professor) ministra.professor = professor;
          await queryRunner.manager.save(ministra);
        }
      }

      if (novaTurma && payload.agendamento && payload.agendamento.turmaAntigaId) {
        const agendaAntiga = await queryRunner.manager.findOne(Agenda, { 
          where: { fkAlunoId: aluno.id, fkTurmaId: payload.agendamento.turmaAntigaId, statusAgenda: StatusAgenda.MATRICULADO } 
        });
        
        if (agendaAntiga && agendaAntiga.fkTurmaId !== novaTurma.id) {
          // Remover agenda antiga
          await queryRunner.manager.delete(Agenda, { fkAlunoId: aluno.id, fkTurmaId: agendaAntiga.fkTurmaId });
          
          // Cancelar aulas futuras da turma antiga
          const hoje = new Date();
          const hojeStr = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
          await queryRunner.manager.createQueryBuilder()
            .update(Aula)
            .set({ statusAula: StatusAula.CANCELADA })
            .where('fk_aluno_id = :alId AND fk_turma_id = :tId AND data_prevista > :hojeStr', { alId: aluno.id, tId: agendaAntiga.fkTurmaId, hojeStr })
            .execute();

          // Inserir nova agenda
          const novaAgenda = new Agenda();
          novaAgenda.fkAlunoId = aluno.id;
          novaAgenda.fkTurmaId = novaTurma.id;
          novaAgenda.aluno = aluno;
          novaAgenda.turma = novaTurma;
          novaAgenda.frequencia = 1; 
          novaAgenda.statusAgenda = StatusAgenda.MATRICULADO;
          novaAgenda.dataInscricao = agendaAntiga.dataInscricao;
          await queryRunner.manager.save(novaAgenda);
        } else if (!agendaAntiga) {
          const agenda = new Agenda();
          agenda.fkAlunoId = aluno.id;
          agenda.fkTurmaId = novaTurma.id;
          agenda.aluno = aluno;
          agenda.turma = novaTurma;
          agenda.frequencia = 1; 
          agenda.statusAgenda = StatusAgenda.MATRICULADO;
          agenda.dataInscricao = new Date();
          await queryRunner.manager.save(agenda);
        }
      }

      // Update Contrato/Financeiro
      const contrato = await queryRunner.manager.findOne(Contrato, { 
        where: { aluno: { id: aluno.id }, curso: { id: payload.financeiro.cursoId }, statusContrato: StatusContrato.ATIVO },
        relations: ['curso']
      });

      if (contrato) {
        const hoje = new Date();
        const novoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), payload.financeiro.diaVencimento);
        if (novoVencimento < hoje) {
          novoVencimento.setMonth(novoVencimento.getMonth() + 1);
        }
        
        const valorAlterado = contrato.valorMensal != payload.financeiro.valorLiquido;
        const diaAnterior = contrato.dataVencimentoParcela ? new Date(contrato.dataVencimentoParcela as any).getDate() : new Date().getDate();
        const diaAlterado = diaAnterior != payload.financeiro.diaVencimento;

        contrato.valorMensal = payload.financeiro.valorLiquido;
        contrato.dataVencimentoParcela = novoVencimento;
        await queryRunner.manager.save(contrato);

        if (valorAlterado || diaAlterado) {
          const faturasPendentes = await queryRunner.manager.find(Fatura, { 
            where: { contrato: { id: contrato.id }, statusFatura: StatusFatura.PENDENTE } 
          });

          for (const fatura of faturasPendentes) {
            fatura.valorDevido = contrato.valorMensal;
            const dataVenc = new Date(fatura.dataVencimento);
            dataVenc.setDate(payload.financeiro.diaVencimento);
            fatura.dataVencimento = dataVenc;
            await queryRunner.manager.save(fatura);
          }
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Matrícula atualizada com sucesso!', alunoId: aluno.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao alterar matrícula:', error);
      return { success: false, message: error.message || 'Erro interno ao alterar matrícula.' };
    } finally {
      await queryRunner.release();
    }
  }

}

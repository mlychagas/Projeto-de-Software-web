import { Body, Controller, Get, Inject, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { AlunoService } from "./aluno.service";
import { DataSource } from "typeorm";
import { Aluno } from "./aluno.entity";
import { Contrato } from "../contrato/contrato.entity";
import { Agenda } from "../agenda/agenda.entity";
import { Aula } from "../aula/aula.entity";
import { Fatura } from "../fatura/fatura.entity";
import { HistoricoRegistro } from "../historico-registro/historico-registro.entity";
import { Ministra } from "../ministra/ministra.entity";

@Controller('alunos')
export class AlunoController {

    constructor(
        private alunoService: AlunoService,
        @Inject('DATA_SOURCE') private dataSource: DataSource
    ) {}

    @Get()
    @Render('aluno/inicial')
    async inicial(): Promise<object> {
        const listaAlunos = await this.alunoService.findAll();
        return { titulo: 'Consulta de Alunos', alunos: listaAlunos };
    }

    @Get('criar')
    @Render('aluno/formulario')
    async formularioCriar(): Promise<object> {
        const responsaveis = await this.alunoService.findAllResponsaveis();
        return {
            titulo: 'Novo Aluno',
            aluno: { nome: '', cpf: '', rg: '', email: '', telefone: '', dataNascimento: '', dataMatricula: '', statusAluno: 'Ativo', responsavel: null },
            responsaveis,
        };
    }

    @Post('criar')
    @Redirect('/alunos')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.alunoService.create(dados);
    }


    @Get(':id/perfil')
    @Render('aluno/perfil')
    async perfil(@Param('id') id: number): Promise<object> {
        // 1. Aluno com Responsável
        const aluno = await this.dataSource.getRepository(Aluno).findOne({
            where: { id },
            relations: ['responsavel'],
        });
        if (!aluno) throw new Error('Aluno não encontrado');

        // 2. Contratos com Curso
        const contratos = await this.dataSource.getRepository(Contrato).find({
            where: { aluno: { id } },
            relations: ['curso'],
            order: { dataInicio: 'DESC' },
        });

        // 3. Agenda (matrículas em turmas) com Turma -> Curso, Sala
        const agendas = await this.dataSource.getRepository(Agenda).find({
            where: { fkAlunoId: id },
            relations: ['turma', 'turma.curso', 'turma.sala'],
        });

        // 4. Para cada agenda, buscar o professor via Ministra
        const agendasComProf: any[] = [];
        for (const ag of agendas) {
            const ministra = await this.dataSource.getRepository(Ministra).findOne({
                where: { fkTurmaId: ag.fkTurmaId },
                relations: ['professor'],
            });
            agendasComProf.push({
                ...ag,
                professor: ministra ? ministra.professor : null,
            });
        }

        // 5. Aulas (histórico)
        const aulas = await this.dataSource.getRepository(Aula).find({
            where: { agenda: { fkAlunoId: id } },
            relations: ['agenda', 'agenda.turma', 'agenda.turma.curso'],
            order: { dataPrevista: 'DESC' },
        });

        // Buscar professor para cada aula
        const aulasComProf: any[] = [];
        for (const aula of aulas) {
            const ministra = await this.dataSource.getRepository(Ministra).findOne({
                where: { fkTurmaId: aula.agenda.fkTurmaId },
                relations: ['professor'],
            });
            aulasComProf.push({
                ...aula,
                professor: ministra ? ministra.professor : null,
            });
        }

        // 6. Faturas
        const contratosIds = contratos.map(c => c.id);
        let faturas: Fatura[] = [];
        if (contratosIds.length > 0) {
            faturas = await this.dataSource.getRepository(Fatura)
                .createQueryBuilder('f')
                .leftJoinAndSelect('f.contrato', 'c')
                .leftJoinAndSelect('c.curso', 'curso')
                .where('f.fk_contrato_id IN (:...ids)', { ids: contratosIds })
                .orderBy('f.data_vencimento', 'DESC')
                .getMany();
        }

        // 7. Histórico e Registros
        const registros = await this.dataSource.getRepository(HistoricoRegistro).find({
            where: { aluno: { id } },
            order: { dataHora: 'DESC' },
        });

        // 8. Dependentes (outros alunos com mesmo responsável)
        let dependentes: Aluno[] = [];
        if (aluno.responsavel) {
            dependentes = await this.dataSource.getRepository(Aluno).find({
                where: { responsavel: { id: aluno.responsavel.id } },
                relations: ['responsavel'],
            });
            // Excluir o próprio aluno da lista
            dependentes = dependentes.filter(d => d.id !== aluno.id);
        }

        // Calcular idade
        const hoje = new Date();
        const nasc = new Date(aluno.dataNascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;

        // Calcular tempo como aluno
        const matriculaDate = new Date(aluno.dataMatricula);
        const diffMs = hoje.getTime() - matriculaDate.getTime();
        const diffMeses = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

        return {
            titulo: `Perfil - ${aluno.nome}`,
            aluno,
            idade,
            tempoAluno: diffMeses,
            contratos,
            agendas: agendasComProf,
            aulas: aulasComProf,
            faturas,
            registros,
            dependentes,
        };
    }

    // API: buscar alunos para vincular como dependente
    @Get(':id/api/dependentes/buscar')
    async buscarAlunos(@Param('id') id: number, @Query('q') q: string) {
        if (!q || q.length < 2) return [];
        const alunos = await this.dataSource.getRepository(Aluno)
            .createQueryBuilder('a')
            .where('a.nome LIKE :q', { q: `%${q}%` })
            .andWhere('a.id != :id', { id })
            .limit(10)
            .getMany();
        return alunos.map(a => ({ id: a.id, nome: a.nome, cpf: a.cpf }));
    }

    // API: vincular dependente (atribuir mesmo responsável)
    @Post(':id/api/dependentes/vincular')
    async vincularDependente(@Param('id') id: number, @Body() body: any) {
        const alunoPrincipal = await this.dataSource.getRepository(Aluno).findOne({
            where: { id },
            relations: ['responsavel'],
        });
        if (!alunoPrincipal) return { success: false, message: 'Aluno principal não encontrado' };

        const dependente = await this.dataSource.getRepository(Aluno).findOne({
            where: { id: body.dependenteId },
        });
        if (!dependente) return { success: false, message: 'Dependente não encontrado' };

        // Vincular ao mesmo responsável
        if (alunoPrincipal.responsavel) {
            dependente.responsavel = alunoPrincipal.responsavel;
        }
        await this.dataSource.getRepository(Aluno).save(dependente);

        return { success: true, message: 'Dependente vinculado com sucesso!' };
    }

    // API: desvincular dependente (remover responsável)
    @Post(':id/api/dependentes/desvincular')
    async desvincularDependente(@Param('id') id: number, @Body() body: any) {
        const dependente = await this.dataSource.getRepository(Aluno).findOne({
            where: { id: body.dependenteId },
        });
        if (!dependente) return { success: false, message: 'Dependente não encontrado' };

        dependente.responsavel = null as any;
        await this.dataSource.getRepository(Aluno).save(dependente);

        return { success: true, message: 'Dependente desvinculado com sucesso!' };
    }


    @Get(':id/editar')
    @Render('aluno/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const aluno = await this.alunoService.findOne(id);
        if (!aluno) throw new Error('Aluno não encontrado');
        const responsaveis = await this.alunoService.findAllResponsaveis();
        return { titulo: 'Editar Aluno', aluno, responsaveis };
    }

    @Post(':id/editar')
    @Redirect('/alunos')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.alunoService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('aluno/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const aluno = await this.alunoService.findOne(id);
        if (!aluno) throw new Error('Aluno não encontrado');
        return {
            titulo: 'Remover Aluno',
            subtitulo: `Confirmação de remoção de ${aluno.nome}`,
            aluno,
            erro: erro ? 'Não é possível excluir este aluno pois existem contratos ou matrículas vinculados a ele.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/alunos')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.alunoService.remove(id);
        } catch {
            return { url: `/alunos/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.alunoService.remove(id);
    }
}

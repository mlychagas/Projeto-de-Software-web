import { Body, Controller, Get, Param, Post, Query, Redirect, Render, Inject } from "@nestjs/common";
import { PessoaService } from "./pessoa.service";
import { DataSource } from "typeorm";
import { Aula } from "../aula/aula.entity";
import { Agenda } from "../agenda/agenda.entity";
import { Contrato } from "../contrato/contrato.entity";
import { Fatura } from "../fatura/fatura.entity";
import { HistoricoRegistro } from "../historico-registro/historico-registro.entity";
import { Ministra } from "../ministra/ministra.entity";

@Controller('pessoas')
export class PessoaController {

    constructor(
        private pessoaService: PessoaService,
        @Inject('DATA_SOURCE') private dataSource: DataSource
    ) {}

    @Get()
    @Render('pessoa/inicial')
    async inicial(): Promise<object> {
        const pessoas = await this.pessoaService.findAll();
        return { titulo: 'Consulta de Pessoas', pessoas };
    }

    @Get('criar')
    @Render('pessoa/formulario')
    async formularioCriar(): Promise<object> {
        return {
            titulo: 'Nova Pessoa',
            pessoa: { 
                nome: '', cpf: '', rg: '', email: '', telefone: '', dataNascimento: '',
                isAluno: false, isProfessor: false, isResponsavel: false, isUsuario: false,
                dataMatricula: '', statusAluno: 'Ativo',
                dataAdmissao: '', statusProf: 'Ativo', especialidade: '', valorHoraAula: 0
            },
        };
    }

    @Post('criar')
    @Redirect('/pessoas')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        // Converter checkboxes on/off para booleanos
        dados.isAluno = dados.isAluno === 'on' || dados.isAluno === true;
        dados.isProfessor = dados.isProfessor === 'on' || dados.isProfessor === true;
        dados.isResponsavel = dados.isResponsavel === 'on' || dados.isResponsavel === true;
        dados.isUsuario = dados.isUsuario === 'on' || dados.isUsuario === true;
        
        await this.pessoaService.create(dados);
    }

    @Get(':id/perfil')
    @Render('pessoa/perfil')
    async perfil(@Param('id') id: number): Promise<object> {
        const pessoa = await this.pessoaService.findOne(id);
        if (!pessoa) throw new Error('Pessoa não encontrada');

        let idade = 0;
        if (pessoa.dataNascimento) {
            const diffMs = Date.now() - new Date(pessoa.dataNascimento).getTime();
            idade = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
        }

        let tempoPessoa = 0;
        const dataInicio = pessoa.dataMatricula || pessoa.dataAdmissao;
        if (dataInicio) {
            const diffMs = Date.now() - new Date(dataInicio).getTime();
            tempoPessoa = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
        }

        const result: any = {
            titulo: 'Perfil - ' + pessoa.nome,
            pessoa,
            idade,
            tempoPessoa,
            agendas: [],
            contratos: [],
            faturas: [],
            aulas: [],
            registros: [],
            dependentes: pessoa.dependentes || [],
            turmasProfessor: []
        };

        // Buscar Registros
        result.registros = await this.dataSource.getRepository(HistoricoRegistro).find({
            where: { pessoa: { id: pessoa.id } },
            order: { dataHora: 'DESC' }
        });

        // Buscar dados acadêmicos e financeiros (agendas/cursos, contratos, aulas, faturas) para qualquer pessoa
        result.agendas = await this.dataSource.getRepository(Agenda).find({
            where: { aluno: { id: pessoa.id } },
            relations: ['turma', 'turma.curso']
        });

        result.contratos = await this.dataSource.getRepository(Contrato).find({
            where: { aluno: { id: pessoa.id } },
            relations: ['curso']
        });

        result.aulas = await this.dataSource.getRepository(Aula).find({
            where: { aluno: { id: pessoa.id } },
            relations: ['turma', 'turma.curso'],
            order: { dataPrevista: 'DESC', horarioInicio: 'DESC' }
        });

        // Faturas associadas aos contratos da pessoa
        const contratoIds = result.contratos.map((c: Contrato) => c.id);
        if (contratoIds.length > 0) {
            result.faturas = await this.dataSource.getRepository(Fatura)
                .createQueryBuilder('fatura')
                .where('fatura.fk_contrato_id IN (:...ids)', { ids: contratoIds })
                .orderBy('fatura.dataVencimento', 'DESC')
                .getMany();
        }

        // Se for Responsável, buscar faturas dos dependentes
        if (pessoa.isResponsavel && pessoa.dependentes && pessoa.dependentes.length > 0) {
            const depIds = pessoa.dependentes.map(d => d.id);
            const contratosDep = await this.dataSource.getRepository(Contrato)
                .createQueryBuilder('contrato')
                .where('contrato.fk_aluno_id IN (:...ids)', { ids: depIds })
                .getMany();
            
            const contratoDepIds = contratosDep.map(c => c.id);
            if (contratoDepIds.length > 0) {
                const faturasResp = await this.dataSource.getRepository(Fatura)
                    .createQueryBuilder('fatura')
                    .where('fatura.fk_contrato_id IN (:...ids)', { ids: contratoDepIds })
                    .orderBy('fatura.dataVencimento', 'DESC')
                    .getMany();
                
                // Mescla ou define faturas
                result.faturas = result.faturas.concat(faturasResp);
            }
        }

        // Se for Professor, buscar turmas e aulas
        if (pessoa.isProfessor) {
            result.turmasProfessor = await this.dataSource.getRepository(Ministra).find({
                where: { professor: { id: pessoa.id } },
                relations: ['turma', 'turma.curso']
            });
            // Opcional: buscar aulas ministradas por ele
        }

        return result;
    }

    @Get(':id/editar')
    @Render('pessoa/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const pessoa = await this.pessoaService.findOne(id);
        if (!pessoa) throw new Error('Pessoa não encontrada');
        return { titulo: 'Editar Pessoa', pessoa };
    }

    @Post(':id/editar')
    @Redirect('/pessoas')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        dados.isAluno = dados.isAluno === 'on' || dados.isAluno === true;
        dados.isProfessor = dados.isProfessor === 'on' || dados.isProfessor === true;
        dados.isResponsavel = dados.isResponsavel === 'on' || dados.isResponsavel === true;
        dados.isUsuario = dados.isUsuario === 'on' || dados.isUsuario === true;
        await this.pessoaService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('pessoa/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const pessoa = await this.pessoaService.findOne(id);
        if (!pessoa) throw new Error('Pessoa não encontrada');
        return {
            titulo: 'Remover Pessoa',
            subtitulo: `Confirmação de remoção de ${pessoa.nome}`,
            pessoa,
            erro: erro ? 'Não é possível excluir esta pessoa pois existem vínculos (turmas, faturas ou dependentes).' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/pessoas')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.pessoaService.remove(id);
        } catch {
            return { url: `/pessoas/${id}/excluir?erro=vinculado` };
        }
    }
}

import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { AlunoService } from "./aluno.service";

@Controller('alunos')
export class AlunoController {

    constructor(private alunoService: AlunoService) {}

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

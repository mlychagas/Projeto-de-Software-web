import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { ResponsavelAlunoService } from "./responsavel-aluno.service";

@Controller('responsaveis')
export class ResponsavelAlunoController {

    constructor(private responsavelAlunoService: ResponsavelAlunoService) {}

    @Get()
    @Render('responsavel-aluno/inicial')
    async inicial(): Promise<object> {
        const listaResponsaveis = await this.responsavelAlunoService.findAll();
        return { titulo: 'Consulta de Responsáveis', responsaveis: listaResponsaveis };
    }

    @Get('criar')
    @Render('responsavel-aluno/formulario')
    async formularioCriar(): Promise<object> {
        return {
            titulo: 'Novo Responsável',
            responsavel: { nome: '', cpf: '', rg: '', email: '', telefone: '', dataNascimento: '', parentesco: '' },
        };
    }

    @Post('criar')
    @Redirect('/responsaveis')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.responsavelAlunoService.create(dados);
    }

    @Get(':id/editar')
    @Render('responsavel-aluno/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const responsavel = await this.responsavelAlunoService.findOne(id);
        if (!responsavel) throw new Error('Responsável não encontrado');
        return { titulo: 'Editar Responsável', responsavel };
    }

    @Post(':id/editar')
    @Redirect('/responsaveis')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.responsavelAlunoService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('responsavel-aluno/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const responsavel = await this.responsavelAlunoService.findOne(id);
        if (!responsavel) throw new Error('Responsável não encontrado');
        return {
            titulo: 'Remover Responsável',
            subtitulo: `Confirmação de remoção de ${responsavel.nome}`,
            responsavel,
            erro: erro ? 'Não é possível excluir este responsável pois existem alunos vinculados a ele.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/responsaveis')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.responsavelAlunoService.remove(id);
        } catch {
            return { url: `/responsaveis/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.responsavelAlunoService.remove(id);
    }
}

import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { CursoService } from "./curso.service";

@Controller('cursos')
export class CursoController {

    constructor(private cursoService: CursoService) {}

    @Get()
    @Render('curso/inicial')
    async inicial(): Promise<object> {
        const listaCursos = await this.cursoService.findAll();
        return { titulo: 'Consulta de Cursos', cursos: listaCursos };
    }

    @Get('criar')
    @Render('curso/formulario')
    async formularioCriar(): Promise<object> {
        return {
            titulo: 'Novo Curso',
            curso: { nome: '', descricao: '', instrumento: '', nivel: 'Iniciante', cargaHoraria: 0, duracaoMeses: 0 },
        };
    }

    @Post('criar')
    @Redirect('/cursos')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.cursoService.create(dados);
    }

    @Get(':id/editar')
    @Render('curso/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const curso = await this.cursoService.findOne(id);
        if (!curso) throw new Error('Curso não encontrado');
        return { titulo: 'Editar Curso', curso };
    }

    @Post(':id/editar')
    @Redirect('/cursos')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.cursoService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('curso/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const curso = await this.cursoService.findOne(id);
        if (!curso) throw new Error('Curso não encontrado');
        return {
            titulo: 'Remover Curso',
            subtitulo: `Confirmação de remoção de ${curso.nome}`,
            curso,
            erro: erro ? 'Não é possível excluir este curso pois existem turmas ou contratos vinculados a ele.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/cursos')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.cursoService.remove(id);
        } catch {
            return { url: `/cursos/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.cursoService.remove(id);
    }
}

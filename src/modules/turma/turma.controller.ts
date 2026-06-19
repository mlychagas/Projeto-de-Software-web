import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { TurmaService } from "./turma.service";

@Controller('turmas')
export class TurmaController {

    constructor(private turmaService: TurmaService) {}

    @Get()
    @Render('turma/inicial')
    async inicial(): Promise<object> {
        const listaTurmas = await this.turmaService.findAll();
        return { titulo: 'Consulta de Turmas', turmas: listaTurmas };
    }

    @Get('criar')
    @Render('turma/formulario')
    async formularioCriar(): Promise<object> {
        const cursos = await this.turmaService.findAllCursos();
        const salas = await this.turmaService.findAllSalas();
        return {
            titulo: 'Nova Turma',
            turma: { nome: '', statusTurma: 'Planejamento', diaSemana: 'Segunda', horarioInicio: '', horarioFim: '', capacidade: 0, dataInicio: '', curso: null, sala: null },
            cursos,
            salas,
        };
    }

    @Post('criar')
    @Redirect('/turmas')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.turmaService.create(dados);
    }

    @Get(':id/editar')
    @Render('turma/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const turma = await this.turmaService.findOne(id);
        if (!turma) throw new Error('Turma não encontrada');
        const cursos = await this.turmaService.findAllCursos();
        const salas = await this.turmaService.findAllSalas();
        return { titulo: 'Editar Turma', turma, cursos, salas };
    }

    @Post(':id/editar')
    @Redirect('/turmas')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.turmaService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('turma/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const turma = await this.turmaService.findOne(id);
        if (!turma) throw new Error('Turma não encontrada');
        return {
            titulo: 'Remover Turma',
            subtitulo: `Confirmação de remoção de ${turma.nome}`,
            turma,
            erro: erro ? 'Não é possível excluir esta turma pois existem matrículas ou vínculos com professores associados a ela.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/turmas')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.turmaService.remove(id);
        } catch {
            return { url: `/turmas/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.turmaService.remove(id);
    }
}

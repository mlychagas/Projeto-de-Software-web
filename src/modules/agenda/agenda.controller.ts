import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { AgendaService } from "./agenda.service";

@Controller('agenda')
export class AgendaController {

    constructor(private agendaService: AgendaService) {}

    @Get()
    @Render('agenda/inicial')
    async inicial(): Promise<object> {
        const listaAgenda = await this.agendaService.findAll();
        return { titulo: 'Consulta de Matrículas em Turmas', agenda: listaAgenda };
    }

    @Get('matricular')
    @Render('agenda/formulario')
    async formularioCriar(): Promise<object> {
        const alunos = await this.agendaService.findAllAlunos();
        const turmas = await this.agendaService.findAllTurmas();
        return { titulo: 'Matricular Aluno em Turma', alunos, turmas };
    }

    @Post('matricular')
    @Redirect('/agenda')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.agendaService.create(dados);
    }

    @Get(':alunoId/:turmaId/editar')
    @Render('agenda/formulario')
    async formularioEditar(@Param('alunoId') alunoId: number, @Param('turmaId') turmaId: number): Promise<object> {
        const matricula = await this.agendaService.findOne(alunoId, turmaId);
        if (!matricula) throw new Error('Matrícula não encontrada');
        const alunos = await this.agendaService.findAllAlunos();
        const turmas = await this.agendaService.findAllTurmas();
        return { titulo: 'Editar Matrícula', matricula, alunos, turmas };
    }

    @Post(':alunoId/:turmaId/editar')
    @Redirect('/agenda')
    async formEditarSalvar(@Param('alunoId') alunoId: number, @Param('turmaId') turmaId: number, @Body() dados: any): Promise<void> {
        await this.agendaService.update(alunoId, turmaId, dados);
    }

    @Get(':alunoId/:turmaId/excluir')
    @Render('agenda/remover')
    async formularioExcluir(@Param('alunoId') alunoId: number, @Param('turmaId') turmaId: number, @Query('erro') erro?: string): Promise<object> {
        const matricula = await this.agendaService.findOne(alunoId, turmaId);
        if (!matricula) throw new Error('Matrícula não encontrada');
        return {
            titulo: 'Remover Matrícula',
            subtitulo: `Confirmação de remoção da matrícula de ${matricula.aluno?.nome}`,
            matricula,
            erro: erro ? 'Não é possível excluir esta matrícula pois existem registros vinculados a ela.' : null,
        };
    }

    @Post(':alunoId/:turmaId/excluir')
    @Redirect('/agenda')
    async formExcluirSalvar(@Param('alunoId') alunoId: number, @Param('turmaId') turmaId: number): Promise<{ url: string } | void> {
        try {
            await this.agendaService.remove(alunoId, turmaId);
        } catch {
            return { url: `/agenda/${alunoId}/${turmaId}/excluir?erro=vinculado` };
        }
    }

    @Post(':alunoId/:turmaId/remover')
    async remove(@Param('alunoId') alunoId: number, @Param('turmaId') turmaId: number): Promise<void> {
        await this.agendaService.remove(alunoId, turmaId);
    }
}

import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { DisponibilidadeProfessorService } from "./disponibilidade-professor.service";

@Controller('disponibilidades')
export class DisponibilidadeProfessorController {

    constructor(private disponibilidadeProfessorService: DisponibilidadeProfessorService) {}

    @Get()
    @Render('disponibilidade-professor/inicial')
    async inicial(): Promise<object> {
        const listaDisponibilidades = await this.disponibilidadeProfessorService.findAll();
        return { titulo: 'Consulta de Disponibilidades de Professores', disponibilidades: listaDisponibilidades };
    }

    @Get('criar')
    @Render('disponibilidade-professor/formulario')
    async formularioCriar(): Promise<object> {
        const professores = await this.disponibilidadeProfessorService.findAllProfessores();
        return {
            titulo: 'Nova Disponibilidade',
            disponibilidade: { diaSemana: 'Segunda', horarioInicio: '', horarioFim: '', statusDisp: 'Disponível', professor: null },
            professores,
        };
    }

    @Post('criar')
    @Redirect('/disponibilidades')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.disponibilidadeProfessorService.create(dados);
    }

    @Get(':id/editar')
    @Render('disponibilidade-professor/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const disponibilidade = await this.disponibilidadeProfessorService.findOne(id);
        if (!disponibilidade) throw new Error('Disponibilidade não encontrada');
        const professores = await this.disponibilidadeProfessorService.findAllProfessores();
        return { titulo: 'Editar Disponibilidade', disponibilidade, professores };
    }

    @Post(':id/editar')
    @Redirect('/disponibilidades')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.disponibilidadeProfessorService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('disponibilidade-professor/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const disponibilidade = await this.disponibilidadeProfessorService.findOne(id);
        if (!disponibilidade) throw new Error('Disponibilidade não encontrada');
        return {
            titulo: 'Remover Disponibilidade',
            subtitulo: `Confirmação de remoção da disponibilidade`,
            disponibilidade,
            erro: erro ? 'Não é possível excluir esta disponibilidade pois existem registros vinculados a ela.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/disponibilidades')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.disponibilidadeProfessorService.remove(id);
        } catch {
            return { url: `/disponibilidades/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.disponibilidadeProfessorService.remove(id);
    }
}

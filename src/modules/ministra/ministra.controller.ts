import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { MinistraService } from "./ministra.service";

@Controller('ministra')
export class MinistraController {

    constructor(private ministraService: MinistraService) {}

    @Get()
    @Render('ministra/inicial')
    async inicial(): Promise<object> {
        const listaVinculos = await this.ministraService.findAll();
        return { titulo: 'Consulta de Professores por Turma', vinculos: listaVinculos };
    }

    @Get('vincular')
    @Render('ministra/formulario')
    async formularioCriar(): Promise<object> {
        const turmas = await this.ministraService.findAllTurmas();
        const professores = await this.ministraService.findAllProfessores();
        return { titulo: 'Vincular Professor à Turma', turmas, professores };
    }

    @Post('vincular')
    @Redirect('/ministra')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.ministraService.create(dados);
    }

    @Get(':turmaId/:professorId/excluir')
    @Render('ministra/remover')
    async formularioExcluir(@Param('turmaId') turmaId: number, @Param('professorId') professorId: number, @Query('erro') erro?: string): Promise<object> {
        const vinculo = await this.ministraService.findOne(turmaId, professorId);
        if (!vinculo) throw new Error('Vínculo não encontrado');
        return {
            titulo: 'Remover Vínculo',
            subtitulo: `Confirmação de remoção do vínculo`,
            vinculo,
            erro: erro ? 'Não é possível excluir este vínculo pois existem registros associados a ele.' : null,
        };
    }

    @Post(':turmaId/:professorId/excluir')
    @Redirect('/ministra')
    async formExcluirSalvar(@Param('turmaId') turmaId: number, @Param('professorId') professorId: number): Promise<{ url: string } | void> {
        try {
            await this.ministraService.remove(turmaId, professorId);
        } catch {
            return { url: `/ministra/${turmaId}/${professorId}/excluir?erro=vinculado` };
        }
    }

    @Post(':turmaId/:professorId/remover')
    async remove(@Param('turmaId') turmaId: number, @Param('professorId') professorId: number): Promise<void> {
        await this.ministraService.remove(turmaId, professorId);
    }
}

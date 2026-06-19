import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { SalaService } from "./sala.service";

@Controller('salas')
export class SalaController {

    constructor(private salaService: SalaService) {}

    @Get()
    @Render('sala/inicial')
    async inicial(): Promise<object> {
        const listaSalas = await this.salaService.findAll();
        return { titulo: 'Consulta de Salas', salas: listaSalas };
    }

    @Get('criar')
    @Render('sala/formulario')
    async formularioCriar(): Promise<object> {
        return {
            titulo: 'Nova Sala',
            sala: { nome: '', localizacao: '', equipamentos: '', capacidade: 0 },
        };
    }

    @Post('criar')
    @Redirect('/salas')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.salaService.create(dados);
    }

    @Get(':id/editar')
    @Render('sala/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const sala = await this.salaService.findOne(id);
        if (!sala) throw new Error('Sala não encontrada');
        return { titulo: 'Editar Sala', sala };
    }

    @Post(':id/editar')
    @Redirect('/salas')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.salaService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('sala/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const sala = await this.salaService.findOne(id);
        if (!sala) throw new Error('Sala não encontrada');
        return {
            titulo: 'Remover Sala',
            subtitulo: `Confirmação de remoção de ${sala.nome}`,
            sala,
            erro: erro ? 'Não é possível excluir esta sala pois existem turmas vinculadas a ela.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/salas')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.salaService.remove(id);
        } catch {
            return { url: `/salas/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.salaService.remove(id);
    }
}

import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { ContratoService } from "./contrato.service";

@Controller('contratos')
export class ContratoController {

    constructor(private contratoService: ContratoService) {}

    @Get()
    @Render('contrato/inicial')
    async inicial(): Promise<object> {
        const listaContratos = await this.contratoService.findAll();
        return { titulo: 'Consulta de Contratos', contratos: listaContratos };
    }

    @Get('criar')
    @Render('contrato/formulario')
    async formularioCriar(): Promise<object> {
        const alunos = await this.contratoService.findAllAlunos();
        const cursos = await this.contratoService.findAllCursos();
        return {
            titulo: 'Novo Contrato',
            contrato: { dataInicio: '', dataFim: '', dataVencimentoParcela: '', valorMensal: '0,00', statusContrato: 'Ativo', aluno: null, curso: null },
            alunos,
            cursos,
        };
    }

    @Post('criar')
    @Redirect('/contratos')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.contratoService.create(dados);
    }

    @Get(':id/editar')
    @Render('contrato/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const contrato = await this.contratoService.findOne(id);
        if (!contrato) throw new Error('Contrato não encontrado');
        const alunos = await this.contratoService.findAllAlunos();
        const cursos = await this.contratoService.findAllCursos();
        return { titulo: 'Editar Contrato', contrato, alunos, cursos };
    }

    @Post(':id/editar')
    @Redirect('/contratos')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.contratoService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('contrato/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const contrato = await this.contratoService.findOne(id);
        if (!contrato) throw new Error('Contrato não encontrado');
        return {
            titulo: 'Remover Contrato',
            subtitulo: `Confirmação de remoção do contrato de ${contrato.aluno?.nome}`,
            contrato,
            erro: erro ? 'Não é possível excluir este contrato pois existem registros vinculados a ele.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/contratos')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.contratoService.remove(id);
        } catch {
            return { url: `/contratos/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.contratoService.remove(id);
    }
}

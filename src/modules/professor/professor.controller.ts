import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from "@nestjs/common";
import { ProfessorService } from "./professor.service";

@Controller('professores')
export class ProfessorController {

    constructor(private professorService: ProfessorService) {}

    @Get()
    @Render('professor/inicial')
    async inicial(): Promise<object> {
        const listaProfessores = await this.professorService.findAll();
        return { titulo: 'Consulta de Professores', professores: listaProfessores };
    }

    @Get('criar')
    @Render('professor/formulario')
    async formularioCriar(): Promise<object> {
        return {
            titulo: 'Novo Professor',
            professor: { nome: '', cpf: '', rg: '', email: '', telefone: '', dataAdmissao: '', statusProf: 'Ativo', especialidade: '', valorHoraAula: '0,00' },
        };
    }

    @Post('criar')
    @Redirect('/professores')
    async formularioCriarSalvar(@Body() dados: any): Promise<void> {
        await this.professorService.create(dados);
    }

    @Get(':id/editar')
    @Render('professor/formulario')
    async formularioEditar(@Param('id') id: number): Promise<object> {
        const professor = await this.professorService.findOne(id);
        if (!professor) throw new Error('Professor não encontrado');
        return { titulo: 'Editar Professor', professor };
    }

    @Post(':id/editar')
    @Redirect('/professores')
    async formEditarSalvar(@Param('id') id: number, @Body() dados: any): Promise<void> {
        await this.professorService.update(id, dados);
    }

    @Get(':id/excluir')
    @Render('professor/remover')
    async formularioExcluir(@Param('id') id: number, @Query('erro') erro?: string): Promise<object> {
        const professor = await this.professorService.findOne(id);
        if (!professor) throw new Error('Professor não encontrado');
        return {
            titulo: 'Remover Professor',
            subtitulo: `Confirmação de remoção de ${professor.nome}`,
            professor,
            erro: erro ? 'Não é possível excluir este professor pois existem turmas ou vínculos associados a ele.' : null,
        };
    }

    @Post(':id/excluir')
    @Redirect('/professores')
    async formExcluirSalvar(@Param('id') id: number): Promise<{ url: string } | void> {
        try {
            await this.professorService.remove(id);
        } catch {
            return { url: `/professores/${id}/excluir?erro=vinculado` };
        }
    }

    @Post(':id/remover')
    async remove(@Param('id') id: number): Promise<void> {
        await this.professorService.remove(id);
    }
}

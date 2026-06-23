import { Body, Controller, Get, Param, Post, Put, Delete, Render, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pessoa, StatusLead } from '../pessoa/pessoa.entity';

@Controller('atendimento')
export class AtendimentoController {
    constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {}

    @Get()
    @Render('atendimento/index')
    async index(): Promise<object> {
        // As contagens e listagens serão carregadas via API na página para maior fluidez
        return { titulo: 'Pessoas Sem Vínculo' };
    }

    @Get('api/leads')
    async getLeads() {
        const repository = this.dataSource.getRepository(Pessoa);
        
        // Pessoas sem vínculo
        const leads = await repository.find({
            where: {
                isAluno: false,
                isProfessor: false,
                isResponsavel: false,
                isUsuario: false
            },
            order: { dataNascimento: 'DESC', id: 'DESC' }
        });

        const totais = {
            total: leads.length,
            ativos: leads.filter(l => l.statusLead === StatusLead.ATIVO).length,
            pendentes: leads.filter(l => l.statusLead === StatusLead.PENDENTE).length,
            incompletos: leads.filter(l => l.statusLead === StatusLead.INCOMPLETO).length,
        };

        return { leads, totais };
    }

    @Get('api/leads/:id')
    async getLead(@Param('id') id: number) {
        const repository = this.dataSource.getRepository(Pessoa);
        const lead = await repository.findOne({ where: { id } });
        if (!lead) throw new Error('Lead não encontrado');
        return lead;
    }

    @Post('api/leads')
    async createLead(@Body() dados: Partial<Pessoa>) {
        const repository = this.dataSource.getRepository(Pessoa);
        
        // Remove ID vazio para evitar erro de NaN
        if (dados.id === null || dados.id === undefined || String(dados.id).trim() === '') {
            delete dados.id;
        }

        // Garante que é criado como Lead
        const pessoa = repository.create({
            ...dados,
            isAluno: false,
            isProfessor: false,
            isResponsavel: false,
            isUsuario: false,
            statusLead: dados.statusLead || StatusLead.ATIVO
        });

        // Derivar Status Incompleto se faltar contato principal
        if (!pessoa.email && !pessoa.telefone) {
            pessoa.statusLead = StatusLead.INCOMPLETO;
        }

        const saved = await repository.save(pessoa);
        return { success: true, lead: saved };
    }

    @Put('api/leads/:id')
    async updateLead(@Param('id') id: number, @Body() dados: Partial<Pessoa>) {
        const repository = this.dataSource.getRepository(Pessoa);
        const pessoa = await repository.findOne({ where: { id } });
        
        if (!pessoa) {
            return { success: false, message: 'Lead não encontrado' };
        }

        Object.assign(pessoa, dados);
        
        // Derivar Status Incompleto se faltar dados
        if (pessoa.statusLead !== StatusLead.ARQUIVADO && pessoa.statusLead !== StatusLead.PENDENTE) {
            if (!pessoa.telefone && !pessoa.email) {
                pessoa.statusLead = StatusLead.INCOMPLETO;
            } else {
                pessoa.statusLead = StatusLead.ATIVO;
            }
        }

        const saved = await repository.save(pessoa);
        return { success: true, lead: saved };
    }

    @Delete('api/leads/:id')
    async deleteLead(@Param('id') id: number) {
        const repository = this.dataSource.getRepository(Pessoa);
        await repository.delete(id);
        return { success: true };
    }
}

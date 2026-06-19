import { Injectable } from "@nestjs/common";
import { Aluno } from "../aluno/aluno.entity";
import { Turma } from "../turma/turma.entity";
import { Agenda } from "./agenda.entity";

@Injectable()
export class AgendaService {

    async findAll(): Promise<Agenda[]> {
        return Agenda.find({ relations: ['aluno', 'turma'] });
    }

    async findOne(alunoId: number, turmaId: number): Promise<Agenda | null> {
        return Agenda.findOne({
            where: { fkAlunoId: alunoId, fkTurmaId: turmaId },
            relations: ['aluno', 'turma'],
        });
    }

    async findAllAlunos(): Promise<Aluno[]> {
        return Aluno.find({ order: { nome: 'ASC' } });
    }

    async findAllTurmas(): Promise<Turma[]> {
        return Turma.find({ order: { nome: 'ASC' } });
    }

    async create(dados: any): Promise<Agenda> {
        const frequencia = parseInt(dados.frequencia ?? '0', 10);
        const agenda = Agenda.create({
            fkAlunoId: parseInt(dados.alunoId, 10),
            fkTurmaId: parseInt(dados.turmaId, 10),
            aluno: { id: parseInt(dados.alunoId, 10) },
            turma: { id: parseInt(dados.turmaId, 10) },
            frequencia,
            statusAgenda: dados.statusAgenda,
            dataInscricao: dados.dataInscricao,
        });
        return agenda.save();
    }

    async update(alunoId: number, turmaId: number, dados: any): Promise<Agenda | null> {
        const agenda = await this.findOne(alunoId, turmaId);
        if (!agenda) return null;

        const frequencia = parseInt(dados.frequencia, 10);
        Object.assign(agenda, { ...dados, frequencia });
        return agenda.save();
    }

    async remove(alunoId: number, turmaId: number): Promise<Agenda | null> {
        const agenda = await this.findOne(alunoId, turmaId);
        if (!agenda) return null;

        return agenda.remove();
    }
}

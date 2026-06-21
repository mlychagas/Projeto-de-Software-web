import { Injectable } from "@nestjs/common";
import { Pessoa } from "../pessoa/pessoa.entity";
import { Turma } from "../turma/turma.entity";
import { Ministra } from "./ministra.entity";

@Injectable()
export class MinistraService {

    async findAll(): Promise<Ministra[]> {
        return Ministra.find({ relations: ['turma', 'professor'] });
    }

    async findOne(turmaId: number, professorId: number): Promise<Ministra | null> {
        return Ministra.findOne({
            where: { fkTurmaId: turmaId, fkProfessorId: professorId },
            relations: ['turma', 'professor'],
        });
    }

    async findAllTurmas(): Promise<Turma[]> {
        return Turma.find({ order: { nome: 'ASC' } });
    }

    async findAllProfessores(): Promise<Pessoa[]> {
        return Pessoa.find({ where: { isProfessor: true }, order: { nome: 'ASC' } });
    }

    async create(dados: any): Promise<Ministra> {
        const vinculo = Ministra.create({
            fkTurmaId: parseInt(dados.turmaId, 10),
            fkProfessorId: parseInt(dados.professorId, 10),
            turma: { id: parseInt(dados.turmaId, 10) },
            professor: { id: parseInt(dados.professorId, 10) },
            dataAtribuicao: dados.dataAtribuicao,
        });
        return vinculo.save();
    }

    async remove(turmaId: number, professorId: number): Promise<Ministra | null> {
        const vinculo = await this.findOne(turmaId, professorId);
        if (!vinculo) return null;

        return vinculo.remove();
    }
}

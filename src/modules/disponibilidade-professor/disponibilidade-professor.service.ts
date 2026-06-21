import { Injectable } from "@nestjs/common";
import { Pessoa } from "../pessoa/pessoa.entity";
import { DisponibilidadeProfessor } from "./disponibilidade-professor.entity";

@Injectable()
export class DisponibilidadeProfessorService {

    async findAll(): Promise<DisponibilidadeProfessor[]> {
        return DisponibilidadeProfessor.find({ relations: ['professor'], order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<DisponibilidadeProfessor | null> {
        return DisponibilidadeProfessor.findOne({ where: { id }, relations: ['professor'] });
    }

    async findAllProfessores(): Promise<Pessoa[]> {
        return Pessoa.find({ where: { isProfessor: true }, order: { nome: 'ASC' } });
    }

    async create(dados: any): Promise<DisponibilidadeProfessor> {
        const disponibilidade = DisponibilidadeProfessor.create({
            ...dados,
            professor: { id: parseInt(dados.professorId, 10) },
        });
        return disponibilidade.save();
    }

    async update(id: number, dados: any): Promise<DisponibilidadeProfessor | null> {
        const disponibilidade = await this.findOne(id);
        if (!disponibilidade) return null;

        Object.assign(disponibilidade, {
            ...dados,
            professor: { id: parseInt(dados.professorId, 10) },
        });
        return disponibilidade.save();
    }

    async remove(id: number): Promise<DisponibilidadeProfessor | null> {
        const disponibilidade = await this.findOne(id);
        if (!disponibilidade) return null;

        return disponibilidade.remove();
    }
}

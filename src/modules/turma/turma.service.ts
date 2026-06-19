import { Injectable } from "@nestjs/common";
import { Curso } from "../curso/curso.entity";
import { Sala } from "../sala/sala.entity";
import { Turma } from "./turma.entity";

@Injectable()
export class TurmaService {

    async findAll(): Promise<Turma[]> {
        return Turma.find({ relations: ['curso', 'sala'], order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<Turma | null> {
        return Turma.findOne({ where: { id }, relations: ['curso', 'sala'] });
    }

    async findAllCursos(): Promise<Curso[]> {
        return Curso.find({ order: { nome: 'ASC' } });
    }

    async findAllSalas(): Promise<Sala[]> {
        return Sala.find({ order: { nome: 'ASC' } });
    }

    async create(dados: any): Promise<Turma> {
        const capacidade = parseInt(dados.capacidade, 10);
        const turma = Turma.create({
            ...dados,
            capacidade,
            curso: { id: parseInt(dados.cursoId, 10) },
            sala: { id: parseInt(dados.salaId, 10) },
        });
        return turma.save();
    }

    async update(id: number, dados: any): Promise<Turma | null> {
        const turma = await this.findOne(id);
        if (!turma) return null;

        const capacidade = parseInt(dados.capacidade, 10);
        Object.assign(turma, {
            ...dados,
            capacidade,
            curso: { id: parseInt(dados.cursoId, 10) },
            sala: { id: parseInt(dados.salaId, 10) },
        });
        return turma.save();
    }

    async remove(id: number): Promise<Turma | null> {
        const turma = await this.findOne(id);
        if (!turma) return null;

        return turma.remove();
    }
}

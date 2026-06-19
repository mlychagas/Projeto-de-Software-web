import { Injectable } from "@nestjs/common";
import { Curso } from "./curso.entity";

@Injectable()
export class CursoService {

    async findAll(): Promise<Curso[]> {
        return Curso.find({ order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<Curso | null> {
        return Curso.findOne({
            where: { id },
            select: { id: true, nome: true, descricao: true, instrumento: true, nivel: true, cargaHoraria: true, duracaoMeses: true },
        });
    }

    async create(dados: any): Promise<Curso> {
        const cargaHoraria = parseInt(dados.cargaHoraria, 10);
        const duracaoMeses = parseInt(dados.duracaoMeses, 10);

        const curso = Curso.create({ ...dados, cargaHoraria, duracaoMeses });
        return curso.save();
    }

    async update(id: number, dados: any): Promise<Curso | null> {
        const curso = await this.findOne(id);
        if (!curso) return null;

        const cargaHoraria = parseInt(dados.cargaHoraria, 10);
        const duracaoMeses = parseInt(dados.duracaoMeses, 10);

        Object.assign(curso, { ...dados, cargaHoraria, duracaoMeses });
        return curso.save();
    }

    async remove(id: number): Promise<Curso | null> {
        const curso = await this.findOne(id);
        if (!curso) return null;

        return curso.remove();
    }
}

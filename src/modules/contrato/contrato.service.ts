import { Injectable } from "@nestjs/common";
import { Aluno } from "../aluno/aluno.entity";
import { Curso } from "../curso/curso.entity";
import { Contrato } from "./contrato.entity";

@Injectable()
export class ContratoService {

    async findAll(): Promise<Contrato[]> {
        return Contrato.find({ relations: ['aluno', 'curso'], order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<Contrato | null> {
        return Contrato.findOne({ where: { id }, relations: ['aluno', 'curso'] });
    }

    async findAllAlunos(): Promise<Aluno[]> {
        return Aluno.find({ order: { nome: 'ASC' } });
    }

    async findAllCursos(): Promise<Curso[]> {
        return Curso.find({ order: { nome: 'ASC' } });
    }

    async create(dados: any): Promise<Contrato> {
        const valorMensal = parseFloat(dados.valorMensal.replace(',', '.'));
        const contrato = Contrato.create({
            ...dados,
            valorMensal,
            aluno: { id: parseInt(dados.alunoId, 10) },
            curso: { id: parseInt(dados.cursoId, 10) },
        });
        return contrato.save();
    }

    async update(id: number, dados: any): Promise<Contrato | null> {
        const contrato = await this.findOne(id);
        if (!contrato) return null;

        const valorMensal = parseFloat(dados.valorMensal.replace(',', '.'));
        Object.assign(contrato, {
            ...dados,
            valorMensal,
            aluno: { id: parseInt(dados.alunoId, 10) },
            curso: { id: parseInt(dados.cursoId, 10) },
        });
        return contrato.save();
    }

    async remove(id: number): Promise<Contrato | null> {
        const contrato = await this.findOne(id);
        if (!contrato) return null;

        return contrato.remove();
    }
}

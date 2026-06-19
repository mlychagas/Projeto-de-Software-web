import { Injectable } from "@nestjs/common";
import { ResponsavelAluno } from "../responsavel-aluno/responsavel-aluno.entity";
import { Aluno } from "./aluno.entity";

@Injectable()
export class AlunoService {

    async findAll(): Promise<Aluno[]> {
        return Aluno.find({ relations: ['responsavel'], order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<Aluno | null> {
        return Aluno.findOne({ where: { id }, relations: ['responsavel'] });
    }

    async findAllResponsaveis(): Promise<ResponsavelAluno[]> {
        return ResponsavelAluno.find({ order: { nome: 'ASC' } });
    }

    async create(dados: any): Promise<Aluno> {
        const aluno = Aluno.create({
            ...dados,
            responsavel: { id: parseInt(dados.responsavelId, 10) },
        });
        return aluno.save();
    }

    async update(id: number, dados: any): Promise<Aluno | null> {
        const aluno = await this.findOne(id);
        if (!aluno) return null;

        Object.assign(aluno, {
            ...dados,
            responsavel: { id: parseInt(dados.responsavelId, 10) },
        });
        return aluno.save();
    }

    async remove(id: number): Promise<Aluno | null> {
        const aluno = await this.findOne(id);
        if (!aluno) return null;

        return aluno.remove();
    }
}

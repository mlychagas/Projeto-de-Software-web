import { Injectable } from "@nestjs/common";
import { ResponsavelAluno } from "./responsavel-aluno.entity";

@Injectable()
export class ResponsavelAlunoService {

    async findAll(): Promise<ResponsavelAluno[]> {
        return ResponsavelAluno.find({ order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<ResponsavelAluno | null> {
        return ResponsavelAluno.findOne({
            where: { id },
            select: { id: true, nome: true, cpf: true, rg: true, email: true, telefone: true, dataNascimento: true, parentesco: true },
        });
    }

    async create(dados: any): Promise<ResponsavelAluno> {
        const responsavel = ResponsavelAluno.create({ ...dados });
        return responsavel.save();
    }

    async update(id: number, dados: any): Promise<ResponsavelAluno | null> {
        const responsavel = await this.findOne(id);
        if (!responsavel) return null;

        Object.assign(responsavel, { ...dados });
        return responsavel.save();
    }

    async remove(id: number): Promise<ResponsavelAluno | null> {
        const responsavel = await this.findOne(id);
        if (!responsavel) return null;

        return responsavel.remove();
    }
}

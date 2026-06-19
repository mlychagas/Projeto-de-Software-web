import { Injectable } from "@nestjs/common";
import { Professor } from "./professor.entity";

@Injectable()
export class ProfessorService {

    async findAll(): Promise<Professor[]> {
        return Professor.find({ order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<Professor | null> {
        return Professor.findOne({
            where: { id },
            select: { id: true, nome: true, cpf: true, rg: true, email: true, telefone: true, dataAdmissao: true, dataDemissao: true, statusProf: true, especialidade: true, valorHoraAula: true },
        });
    }

    async create(dados: any): Promise<Professor> {
        const valorHoraAula = parseFloat(dados.valorHoraAula.replace(',', '.'));
        const professor = Professor.create({ ...dados, valorHoraAula });
        return professor.save();
    }

    async update(id: number, dados: any): Promise<Professor | null> {
        const professor = await this.findOne(id);
        if (!professor) return null;

        const valorHoraAula = parseFloat(dados.valorHoraAula.replace(',', '.'));
        Object.assign(professor, { ...dados, valorHoraAula });
        return professor.save();
    }

    async remove(id: number): Promise<Professor | null> {
        const professor = await this.findOne(id);
        if (!professor) return null;

        return professor.remove();
    }
}

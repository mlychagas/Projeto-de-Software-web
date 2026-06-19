import { Injectable } from "@nestjs/common";
import { Sala } from "./sala.entity";

@Injectable()
export class SalaService {

    async findAll(): Promise<Sala[]> {
        return Sala.find({ order: { id: 'ASC' } });
    }

    async findOne(id: number): Promise<Sala | null> {
        return Sala.findOne({
            where: { id },
            select: { id: true, nome: true, localizacao: true, equipamentos: true, capacidade: true },
        });
    }

    async create(dados: any): Promise<Sala> {
        const capacidade = parseInt(dados.capacidade, 10);
        const sala = Sala.create({ ...dados, capacidade });
        return sala.save();
    }

    async update(id: number, dados: any): Promise<Sala | null> {
        const sala = await this.findOne(id);
        if (!sala) return null;

        const capacidade = parseInt(dados.capacidade, 10);
        Object.assign(sala, { ...dados, capacidade });
        return sala.save();
    }

    async remove(id: number): Promise<Sala | null> {
        const sala = await this.findOne(id);
        if (!sala) return null;

        return sala.remove();
    }
}

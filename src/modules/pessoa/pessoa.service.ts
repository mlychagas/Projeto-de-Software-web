import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Pessoa } from "./pessoa.entity";

@Injectable()
export class PessoaService {
    private pessoaRepository: Repository<Pessoa>;

    constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {
        this.pessoaRepository = this.dataSource.getRepository(Pessoa);
    }

    async findAll(): Promise<Pessoa[]> {
        return this.pessoaRepository.find({ order: { nome: 'ASC' } });
    }

    async findAlunos(): Promise<Pessoa[]> {
        return this.pessoaRepository.find({ where: { isAluno: true }, order: { nome: 'ASC' } });
    }

    async findProfessores(): Promise<Pessoa[]> {
        return this.pessoaRepository.find({ where: { isProfessor: true }, order: { nome: 'ASC' } });
    }

    async findResponsaveis(): Promise<Pessoa[]> {
        return this.pessoaRepository.find({ where: { isResponsavel: true }, order: { nome: 'ASC' } });
    }

    async findOne(id: number): Promise<Pessoa | null> {
        return this.pessoaRepository.findOne({ 
            where: { id },
            relations: ['responsavel', 'dependentes']
        });
    }

    async create(dados: Partial<Pessoa>): Promise<Pessoa> {
        const nova = this.pessoaRepository.create(dados);
        return this.pessoaRepository.save(nova);
    }

    async update(id: number, dados: Partial<Pessoa>): Promise<Pessoa> {
        await this.pessoaRepository.update(id, dados);
        return this.findOne(id) as Promise<Pessoa>;
    }

    async remove(id: number): Promise<void> {
        await this.pessoaRepository.delete(id);
    }
}

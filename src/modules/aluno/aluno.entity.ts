import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ResponsavelAluno } from "../responsavel-aluno/responsavel-aluno.entity";

export enum StatusAluno {
    ATIVO = 'Ativo',
    INATIVO = 'Inativo',
    CANCELADO = 'Cancelado',
    SUSPENSO = 'Suspenso',
}

@Entity('aluno')
export class Aluno extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 11, unique: true })
    cpf!: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    rg!: string;

    @Column({ type: 'varchar', length: 150 })
    nome!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefone?: string;

    @Column({ type: 'date', name: 'data_nascimento' })
    dataNascimento!: Date;

    @ManyToOne(() => ResponsavelAluno, { nullable: false })
    @JoinColumn({ name: 'fk_id_responsavel' })
    responsavel!: ResponsavelAluno;

    @Column({ type: 'date', name: 'data_matricula' })
    dataMatricula!: Date;

    @Column({ type: 'enum', enum: StatusAluno, default: StatusAluno.ATIVO, name: 'status_aluno' })
    statusAluno!: StatusAluno;
}

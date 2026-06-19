import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Parentesco {
    PAI = 'Pai',
    MAE = 'Mãe',
    AVO = 'Avó',
    TIO = 'Tio',
    TIA = 'Tia',
    TUTOR = 'Tutor',
    OUTRO = 'Outro',
}

@Entity('responsavel_aluno')
export class ResponsavelAluno extends BaseEntity {
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

    @Column({ type: 'varchar', length: 20 })
    telefone!: string;

    @Column({ type: 'date', name: 'data_nascimento' })
    dataNascimento!: Date;

    @Column({ type: 'enum', enum: Parentesco })
    parentesco!: Parentesco;
}

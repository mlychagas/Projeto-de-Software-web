import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pessoa } from "../pessoa/pessoa.entity";
import { Curso } from "../curso/curso.entity";

export enum StatusContrato {
    ATIVO = 'Ativo',
    CANCELADO = 'Cancelado',
    ENCERRADO = 'Encerrado',
    SUSPENSO = 'Suspenso',
}

@Entity('contrato')
export class Contrato extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Pessoa, { nullable: false })
    @JoinColumn({ name: 'fk_aluno_id' })
    aluno!: Pessoa;

    @ManyToOne(() => Curso, { nullable: false })
    @JoinColumn({ name: 'fk_curso_id' })
    curso!: Curso;

    @Column({ type: 'date', name: 'data_inicio' })
    dataInicio!: Date;

    @Column({ type: 'date', name: 'data_fim', nullable: true })
    dataFim?: Date;

    @Column({ type: 'date', name: 'data_vencimento_parcela', nullable: true })
    dataVencimentoParcela?: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_mensal' })
    valorMensal!: number;

    @Column({ type: 'enum', enum: StatusContrato, default: StatusContrato.ATIVO, name: 'status_contrato' })
    statusContrato!: StatusContrato;
}

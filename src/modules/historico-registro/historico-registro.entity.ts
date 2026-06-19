import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Aluno } from "../aluno/aluno.entity";

export enum TipoRegistro {
    AULA_REAGENDADA = 'Aula Reagendada',
    MATRICULA_RENOVADA = 'Matrícula Renovada',
    MATRICULA_CRIADA = 'Matrícula Criada',
    MATRICULA_CANCELADA = 'Matrícula Cancelada',
    PROFESSOR_ALTERADO = 'Professor Alterado',
    FATURA_PAGA = 'Fatura Paga',
    CADASTRO_ATUALIZADO = 'Cadastro Atualizado',
    ANOTACAO = 'Anotação',
    OUTRO = 'Outro',
}

@Entity('historico_registro')
export class HistoricoRegistro extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Aluno, { nullable: false })
    @JoinColumn({ name: 'fk_aluno_id' })
    aluno!: Aluno;

    @Column({ type: 'datetime', name: 'data_hora' })
    dataHora!: Date;

    @Column({ type: 'text' })
    descricao!: string;

    @Column({ type: 'enum', enum: TipoRegistro, name: 'tipo_registro' })
    tipoRegistro!: TipoRegistro;

    @Column({ type: 'varchar', length: 150, name: 'responsavel_registro' })
    responsavelRegistro!: string;
}

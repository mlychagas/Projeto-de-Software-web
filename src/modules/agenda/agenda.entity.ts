import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Aluno } from "../aluno/aluno.entity";
import { Turma } from "../turma/turma.entity";

export enum StatusAgenda {
    MATRICULADO = 'Matriculado',
    CANCELADO = 'Cancelado',
    SUSPENSO = 'Suspenso',
    CONCLUIDO = 'Concluído',
}

@Entity('agenda')
export class Agenda extends BaseEntity {
    @PrimaryColumn({ name: 'fk_aluno_id' })
    fkAlunoId!: number;

    @PrimaryColumn({ name: 'fk_turma_id' })
    fkTurmaId!: number;

    @ManyToOne(() => Aluno, { nullable: false })
    @JoinColumn({ name: 'fk_aluno_id' })
    aluno!: Aluno;

    @ManyToOne(() => Turma, { nullable: false })
    @JoinColumn({ name: 'fk_turma_id' })
    turma!: Turma;

    @Column({ type: 'int', default: 0 })
    frequencia!: number;

    @Column({ type: 'enum', enum: StatusAgenda, default: StatusAgenda.MATRICULADO, name: 'status_agenda' })
    statusAgenda!: StatusAgenda;

    @Column({ type: 'date', name: 'data_inscricao' })
    dataInscricao!: Date;

    @Column({ type: 'date', name: 'data_cancelamento', nullable: true })
    dataCancelamento?: Date;
}

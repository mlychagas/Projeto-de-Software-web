import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Professor } from "../professor/professor.entity";
import { Turma } from "../turma/turma.entity";

@Entity('ministra')
export class Ministra extends BaseEntity {
    @PrimaryColumn({ name: 'fk_turma_id' })
    fkTurmaId!: number;

    @PrimaryColumn({ name: 'fk_professor_id' })
    fkProfessorId!: number;

    @ManyToOne(() => Turma, { nullable: false })
    @JoinColumn({ name: 'fk_turma_id' })
    turma!: Turma;

    @ManyToOne(() => Professor, { nullable: false })
    @JoinColumn({ name: 'fk_professor_id' })
    professor!: Professor;

    @Column({ type: 'date', name: 'data_atribuicao' })
    dataAtribuicao!: Date;
}

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Agenda } from "../agenda/agenda.entity";

export enum StatusPresenca {
    PENDENTE = 'Pendente',
    PRESENTE = 'Presente',
    FALTOU = 'Faltou',
    JUSTIFICADA = 'Justificada',
}

export enum StatusAula {
    AGENDADA = 'Agendada',
    REALIZADA = 'Realizada',
    CANCELADA = 'Cancelada',
}

@Entity('aula')
export class Aula extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // A sessão pertence a uma matrícula na Turma (Agenda)
    @ManyToOne(() => Agenda, { nullable: false })
    @JoinColumn([
        { name: 'fk_aluno_id', referencedColumnName: 'fkAlunoId' },
        { name: 'fk_turma_id', referencedColumnName: 'fkTurmaId' }
    ])
    agenda!: Agenda;

    @Column({ type: 'date', name: 'data_prevista' })
    dataPrevista!: Date;

    @Column({ type: 'date', name: 'data_realizada', nullable: true })
    dataRealizada?: Date;

    @Column({ type: 'time', name: 'horario_inicio' })
    horarioInicio!: string;

    @Column({ type: 'time', name: 'horario_fim' })
    horarioFim!: string;

    @Column({ type: 'enum', enum: StatusPresenca, default: StatusPresenca.PENDENTE, name: 'status_presenca_aluno' })
    statusPresencaAluno!: StatusPresenca;

    @Column({ type: 'enum', enum: StatusPresenca, default: StatusPresenca.PENDENTE, name: 'status_presenca_professor' })
    statusPresencaProfessor!: StatusPresenca;

    @Column({ type: 'boolean', default: false })
    reagendado!: boolean;

    @Column({ type: 'enum', enum: StatusAula, default: StatusAula.AGENDADA, name: 'status_aula' })
    statusAula!: StatusAula;

    @Column({ type: 'text', nullable: true })
    observacoes?: string;
}

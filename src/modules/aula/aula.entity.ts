import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pessoa } from "../pessoa/pessoa.entity";
import { Turma } from "../turma/turma.entity";

export enum StatusPresenca {
    PRESENTE = 'Presente',
    FALTOU = 'Faltou',
    PENDENTE = 'Pendente',
    JUSTIFICADO = 'Justificado'
}

export enum StatusAula {
    AGENDADA = 'Agendada',
    REALIZADA = 'Realizada',
    CANCELADA = 'Cancelada',
    ADIADA = 'Adiada'
}

@Entity('aula')
export class Aula extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Pessoa)
    @JoinColumn({ name: 'fk_aluno_id' })
    aluno!: Pessoa;

    @ManyToOne(() => Turma)
    @JoinColumn({ name: 'fk_turma_id' })
    turma!: Turma;

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

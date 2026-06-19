import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Curso } from "../curso/curso.entity";
import { Sala } from "../sala/sala.entity";

export enum StatusTurma {
    PLANEJAMENTO = 'Planejamento',
    EM_ANDAMENTO = 'Em Andamento',
    CONCLUIDA = 'Concluída',
    CANCELADA = 'Cancelada',
    SUSPENSA = 'Suspensa',
}

export enum DiaSemana {
    SEGUNDA = 'Segunda',
    TERCA = 'Terça',
    QUARTA = 'Quarta',
    QUINTA = 'Quinta',
    SEXTA = 'Sexta',
    SABADO = 'Sábado',
    DOMINGO = 'Domingo',
}

@Entity('turma')
export class Turma extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    nome!: string;

    @ManyToOne(() => Curso, { nullable: false })
    @JoinColumn({ name: 'fk_curso' })
    curso!: Curso;

    @ManyToOne(() => Sala, { nullable: false })
    @JoinColumn({ name: 'fk_sala' })
    sala!: Sala;

    @Column({ type: 'enum', enum: StatusTurma, default: StatusTurma.PLANEJAMENTO, name: 'status_turma' })
    statusTurma!: StatusTurma;

    @Column({ type: 'enum', enum: DiaSemana, name: 'dia_semana' })
    diaSemana!: DiaSemana;

    @Column({ type: 'time', name: 'horario_inicio' })
    horarioInicio!: string;

    @Column({ type: 'time', name: 'horario_fim' })
    horarioFim!: string;

    @Column({ type: 'int' })
    capacidade!: number;

    @Column({ type: 'date', name: 'data_inicio' })
    dataInicio!: Date;

    @Column({ type: 'date', name: 'data_fim', nullable: true })
    dataFim?: Date;
}

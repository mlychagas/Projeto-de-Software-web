import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pessoa } from "../pessoa/pessoa.entity";
import { DiaSemana } from "../turma/turma.entity";

export enum StatusDisponibilidade {
    DISPONIVEL = 'Disponível',
    INDISPONIVEL = 'Indisponível',
    BLOQUEADO = 'Bloqueado',
}

@Entity('disponibilidade_professor')
export class DisponibilidadeProfessor extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Pessoa, { nullable: false })
    @JoinColumn({ name: 'fk_professor_id' })
    professor!: Pessoa;

    @Column({ type: 'enum', enum: DiaSemana, name: 'dia_semana' })
    diaSemana!: DiaSemana;

    @Column({ type: 'time', name: 'horario_inicio' })
    horarioInicio!: string;

    @Column({ type: 'time', name: 'horario_fim' })
    horarioFim!: string;

    @Column({ type: 'enum', enum: StatusDisponibilidade, default: StatusDisponibilidade.DISPONIVEL, name: 'status_disp' })
    statusDisp!: StatusDisponibilidade;
}

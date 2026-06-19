import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum StatusProfessor {
    ATIVO = 'Ativo',
    INATIVO = 'Inativo',
    AFASTADO = 'Afastado',
    DESLIGADO = 'Desligado',
}

@Entity('professor')
export class Professor extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 150 })
    nome!: string;

    @Column({ type: 'varchar', length: 11, unique: true })
    cpf!: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    rg!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 20 })
    telefone!: string;

    @Column({ type: 'date', name: 'data_admissao' })
    dataAdmissao!: Date;

    @Column({ type: 'date', name: 'data_demissao', nullable: true })
    dataDemissao?: Date;

    @Column({ type: 'enum', enum: StatusProfessor, default: StatusProfessor.ATIVO, name: 'status_prof' })
    statusProf!: StatusProfessor;

    @Column({ type: 'varchar', length: 100 })
    especialidade!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_hora_aula' })
    valorHoraAula!: number;
}

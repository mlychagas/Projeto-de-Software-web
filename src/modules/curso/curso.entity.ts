import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum NivelCurso {
    INICIANTE = 'Iniciante',
    INTERMEDIARIO = 'Intermediário',
    AVANCADO = 'Avançado',
}

@Entity('curso')
export class Curso extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    nome!: string;

    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @Column({ type: 'varchar', length: 100 })
    instrumento!: string;

    @Column({ type: 'enum', enum: NivelCurso })
    nivel!: NivelCurso;

    @Column({ type: 'int', name: 'carga_horaria' })
    cargaHoraria!: number;

    @Column({ type: 'int', name: 'duracao_meses' })
    duracaoMeses!: number;
}

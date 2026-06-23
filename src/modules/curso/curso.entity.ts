import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum NivelCurso {
    INICIANTE = 'Iniciante',
    INTERMEDIARIO = 'Intermediário',
    AVANCADO = 'Avançado',
}

export enum ModalidadeCurso {
    INDIVIDUAL = 'Individual',
    GRUPO = 'Grupo',
}

export enum StatusCurso {
    ATIVO = 'Ativo',
    INATIVO = 'Inativo',
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

    @Column({ type: 'enum', enum: ModalidadeCurso, default: ModalidadeCurso.INDIVIDUAL, nullable: true })
    modalidade?: ModalidadeCurso;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_mensalidade', nullable: true })
    valorMensalidade?: number;

    @Column({ type: 'enum', enum: StatusCurso, default: StatusCurso.ATIVO, name: 'status_curso', nullable: true })
    statusCurso?: StatusCurso;
}

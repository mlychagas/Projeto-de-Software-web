import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum StatusPessoa {
    ATIVO = 'Ativo',
    INATIVO = 'Inativo',
    AFASTADO = 'Afastado',
    DESLIGADO = 'Desligado',
    CANCELADO = 'Cancelado',
    SUSPENSO = 'Suspenso',
}

@Entity('pessoa')
export class Pessoa extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 11, unique: true })
    cpf!: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    rg!: string;

    @Column({ type: 'varchar', length: 150 })
    nome!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefone?: string;

    @Column({ type: 'date', name: 'data_nascimento', nullable: true })
    dataNascimento?: Date;

    // Papéis
    @Column({ type: 'boolean', default: false, name: 'is_aluno' })
    isAluno!: boolean;

    @Column({ type: 'boolean', default: false, name: 'is_professor' })
    isProfessor!: boolean;

    @Column({ type: 'boolean', default: false, name: 'is_responsavel' })
    isResponsavel!: boolean;

    @Column({ type: 'boolean', default: false, name: 'is_usuario' })
    isUsuario!: boolean;

    // Campos específicos de Aluno
    @Column({ type: 'date', name: 'data_matricula', nullable: true })
    dataMatricula?: Date;

    @Column({ type: 'enum', enum: StatusPessoa, default: StatusPessoa.ATIVO, name: 'status_aluno', nullable: true })
    statusAluno?: StatusPessoa;

    // Campos específicos de Professor
    @Column({ type: 'date', name: 'data_admissao', nullable: true })
    dataAdmissao?: Date;

    @Column({ type: 'date', name: 'data_demissao', nullable: true })
    dataDemissao?: Date;

    @Column({ type: 'enum', enum: StatusPessoa, default: StatusPessoa.ATIVO, name: 'status_prof', nullable: true })
    statusProf?: StatusPessoa;

    @Column({ type: 'varchar', length: 100, nullable: true })
    especialidade?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_hora_aula', nullable: true })
    valorHoraAula?: number;

    // Relacionamento de Dependentes (Auto-referência)
    @ManyToOne(() => Pessoa, pessoa => pessoa.dependentes, { nullable: true })
    @JoinColumn({ name: 'fk_id_responsavel' })
    responsavel?: Pessoa;

    @OneToMany(() => Pessoa, pessoa => pessoa.responsavel)
    dependentes?: Pessoa[];

    @Column({ type: 'varchar', length: 50, nullable: true })
    parentesco?: string;

    // Dados Pessoais Extras
    @Column({ type: 'varchar', length: 10, nullable: true })
    pronome?: string;

    // Endereço
    @Column({ type: 'varchar', length: 10, nullable: true })
    cep?: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    logradouro?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    numero?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    complemento?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    bairro?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    cidade?: string;

    @Column({ type: 'varchar', length: 2, nullable: true })
    estado?: string;
}

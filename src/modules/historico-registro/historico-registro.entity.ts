import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pessoa } from "../pessoa/pessoa.entity";

export enum TipoRegistro {
    AULA_REAGENDADA = 'Aula Reagendada',
    MATRICULA_RENOVADA = 'Matrícula Renovada',
    MATRICULA_CRIADA = 'Matrícula Criada',
    MATRICULA_CANCELADA = 'Matrícula Cancelada',
    PROFESSOR_ALTERADO = 'Professor Alterado',
    FATURA_PAGA = 'Fatura Paga',
    CADASTRO_ATUALIZADO = 'Cadastro Atualizado',
    ANOTACAO = 'Anotação',
    OUTRO = 'Outro',
}

@Entity('historico_registro')
export class HistoricoRegistro extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Pessoa, { nullable: false })
    @JoinColumn({ name: 'fk_aluno_id' }) // Mantemos o nome da coluna no banco para não quebrar queries muito cruas
    pessoa!: Pessoa;

    @Column({ type: 'datetime', name: 'data_hora' })
    dataHora!: Date;

    @Column({ type: 'text' })
    descricao!: string;

    @Column({ type: 'enum', enum: TipoRegistro, name: 'tipo_registro' })
    tipoRegistro!: TipoRegistro;

    @Column({ type: 'varchar', length: 150, name: 'responsavel_registro' })
    responsavelRegistro!: string;
}

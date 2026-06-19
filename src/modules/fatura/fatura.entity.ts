import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Contrato } from "../contrato/contrato.entity";

export enum StatusFatura {
    PENDENTE = 'Pendente',
    PAGA = 'Paga',
    VENCIDA = 'Vencida',
    CANCELADA = 'Cancelada',
}

export enum FormaPagamento {
    PIX = 'Pix',
    BOLETO = 'Boleto',
    CARTAO_CREDITO = 'Cartão de Crédito',
    CARTAO_DEBITO = 'Cartão de Débito',
    DINHEIRO = 'Dinheiro',
    TRANSFERENCIA = 'Transferência',
}

@Entity('fatura')
export class Fatura extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Contrato, { nullable: false })
    @JoinColumn({ name: 'fk_contrato_id' })
    contrato!: Contrato;

    @Column({ type: 'date', name: 'data_vencimento' })
    dataVencimento!: Date;

    @Column({ type: 'date', name: 'data_pagamento', nullable: true })
    dataPagamento?: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_devido' })
    valorDevido!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'desconto_juros', default: 0 })
    descontoJuros!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_pago', default: 0 })
    valorPago!: number;

    @Column({ type: 'enum', enum: StatusFatura, default: StatusFatura.PENDENTE, name: 'status_fatura' })
    statusFatura!: StatusFatura;

    @Column({ type: 'enum', enum: FormaPagamento, nullable: true, name: 'forma_pagamento' })
    formaPagamento?: FormaPagamento;

    @Column({ type: 'varchar', length: 100, nullable: true })
    recebedor?: string;

    @Column({ type: 'varchar', length: 255 })
    descricao!: string;
}

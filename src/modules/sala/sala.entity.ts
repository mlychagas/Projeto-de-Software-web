import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('sala')
export class Sala extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    nome!: string;

    @Column({ type: 'varchar', length: 100 })
    localizacao!: string;

    @Column({ type: 'text', nullable: true })
    equipamentos?: string;

    @Column({ type: 'int' })
    capacidade!: number;
}

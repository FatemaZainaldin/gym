import {  CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @CreateDateColumn({type:'timestamptz'})
    createdAt: Date;

    @UpdateDateColumn({type:'timestamptz'})
    updatedAt: Date;

    @DeleteDateColumn({type:'timestamptz'})       // soft-delete — never hard delete in production
    deletedAt?: Date;
}

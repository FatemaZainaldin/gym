import { BaseEntity } from "../../common/entities/base.entity";
import { Column, Index, JoinColumn, ManyToOne } from "typeorm";
import { Tenant } from "./tenant.entity";

export abstract class TenantBaseEntity extends BaseEntity {

    @Index()
    @Column({ type: 'uuid', nullable: true })
    tenantId: string;

    @ManyToOne(() => Tenant, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    tenant?: Tenant;

}
import { BaseEntity } from "../../common/entities/base.entity";
import { Column, Index, JoinColumn, ManyToOne } from "typeorm";
import { Tenant } from "./tenant.entity";

export abstract class TenantBaseEntity  extends BaseEntity {

    @Index()
    @Column({ type: 'uuid' })
    tenantId: string;

    @ManyToOne(() => Tenant, { lazy: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenantId' })
    tenant?: Promise<Tenant>;

}
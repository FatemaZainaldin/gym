// src/modules/navigation/entities/nav-item.entity.ts
import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';
import { UserRole } from '../../users/entities/user.entity';
import { BaseEntity } from '../../common/entities/base.entity';


@Entity('nav_items')
@Tree('adjacency-list')  // ← Change this
export class NavItem extends BaseEntity {
  @Column({ length: 100 })
  id_key: string;             // e.g. 'members', 'classes.calendar'

  @Column({ length: 100 })
  title: string;

  @Column({ length: 100, nullable: true })
  icon?: string;              // heroicons name e.g. 'heroicons_outline:users'

  @Column({ length: 300, nullable: true })
  link?: string;              // router link e.g. '/admin/members'

  @Column({ default: 'basic' })
  type: 'basic' | 'collapsable' | 'group' | 'divider';

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  // Which roles can see this item
  @Column({ type: 'simple-array' })
  roles: UserRole[];

  // Optional badge (e.g. unread count)
  @Column({ nullable: true, length: 100 })
  badge?: string;

  @TreeChildren()
  children: NavItem[];
  // Explicitly define parentId column as UUID
  @Column({ type: 'uuid', nullable: true })
  parentId: string;  // ← Add this explicitly
  
  @TreeParent()
  parent?: NavItem;
}
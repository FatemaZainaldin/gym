// src/modules/navigation/navigation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { UserRole } from '../users/entities/user.entity';
import { NavItem } from './entities/navItem.entity';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(NavItem) private readonly navRepo: Repository<NavItem>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async getForRole(role: UserRole): Promise<NavItem[]> {
    const cacheKey = `nav:${role}`;

    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Load from DB — only items for this role, ordered
    const items = await this.navRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    const filtered = items.filter(item => item.roles.includes(role));

    // Cache for 5 minutes — admin can bust by updating nav items
    await this.redis.set(cacheKey, JSON.stringify(filtered), 'EX', 300);

    return filtered;
  }

  async bustCache(role?: UserRole): Promise<void> {
    if (role) {
      await this.redis.del(`nav:${role}`);
    } else {
      // Bust all role caches
      for (const r of Object.values(UserRole)) {
        await this.redis.del(`nav:${r}`);
      }
    }
  }
}
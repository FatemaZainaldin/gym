// src/modules/auth/auth.service.ts
import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, ForbiddenException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { NavItem } from 'src/navigation/entities/navItem.entity';

export class LoginResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  modules: NavItem[];
}
// What we put inside the JWT access token
export interface JwtPayload {
  sub: string;         // user UUID
  email: string;
  role: any;
  iat?: number;
  exp?: number;
}

// What we return to the client on login / refresh
export interface AuthTokens {
  accessToken: string;
  accessExpires: number;   // Unix timestamp — Angular knows when to refresh
}

@Injectable()
export class AuthService {
  private readonly ACCESS_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_EXPIRES: number;
  private readonly REFRESH_EXPIRES: number;
  private readonly BCRYPT_ROUNDS: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(NavItem)
    private readonly navItemRepo: Repository<NavItem>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.ACCESS_SECRET = this.config.get<string>('jwt.accessSecret')!;
    this.REFRESH_SECRET = this.config.get<string>('jwt.refreshSecret')!;
    this.ACCESS_EXPIRES = this.config.get<number>('jwt.accessExpiresIn')!;
    this.REFRESH_EXPIRES = this.config.get<number>('jwt.refreshExpiresIn')!;
    this.BCRYPT_ROUNDS = this.config.get<number>('bcrypt.rounds')!;
  }

  // ── REGISTER ────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() }
    });

    if (exists) throw new ConflictException('Email already registered');

    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase().trim(),
      password: dto.password, // hashed by @BeforeInsert in entity
      role: dto.role || 'customer', // Provide default role
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepo.save(user);

    return savedUser;
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────
  async login(dto: LoginDto, ipAddress: string): Promise<AuthTokens & { refreshToken: string }> {
    // 1. Find user — always lowercase email
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() }
    });

    // 2. Constant-time comparison — prevent timing attacks
    let validPassword = false;

    if (user) {
      validPassword = await user.validatePassword(dto.password);
    } else {
      // Use dummy comparison to prevent timing attacks
      await bcrypt.compare(dto.password, '$2b$12$invalid_hash_to_waste_time');
    }

    if (!user || !validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    // 3. Issue tokens
    const tokens = await this.issueTokens(user);

    // 4. Log the login event (audit trail)
    await this.redis.lpush(
      `audit:login:${user.id}`,
      JSON.stringify({ ip: ipAddress, at: new Date().toISOString() })
    );

    return tokens;
  }

  // ── REFRESH ──────────────────────────────────────────────────────────────
  async refresh(rawRefreshToken: string): Promise<AuthTokens & { refreshToken: string }> {
    // 1. Verify refresh token signature
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. Check token is not blacklisted
    const blacklisted = await this.redis.get(`blacklist:refresh:${rawRefreshToken}`);
    if (blacklisted) throw new UnauthorizedException('Token has been revoked');

    // 3. Load user and verify stored hash matches
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session not found');
    }

    const hashMatch = await bcrypt.compare(rawRefreshToken, user.refreshTokenHash);
    if (!hashMatch) throw new UnauthorizedException('Token mismatch — possible replay attack');

    // 4. Blacklist the OLD refresh token (rotation — prevents replay)
    const refreshTtl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redis.set(`blacklist:refresh:${rawRefreshToken}`, '1', 'EX', refreshTtl);

    // 5. Issue brand new token pair
    return this.issueTokens(user);
  }

  // ── LOGOUT ───────────────────────────────────────────────────────────────
  async logout(userId: string, accessToken: string, refreshToken?: string): Promise<void> {
    // 1. Blacklist the access token for its remaining lifetime
    try {
      const decoded = this.jwtService.decode<JwtPayload>(accessToken);
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.set(`blacklist:access:${accessToken}`, '1', 'EX', ttl);
        }
      }
    } catch (error) {
      // ignore decode errors — token already invalid
    }

    // 2. Blacklist the refresh token
    if (refreshToken) {
      await this.redis.set(`blacklist:refresh:${refreshToken}`, '1', 'EX', 7 * 86400);
    }

    // 3. Clear stored refresh hash — invalidates ALL existing refresh tokens for this user
    await this.userRepo.update(userId, { refreshTokenHash: null as any });
  }

  // ── FORGOT PASSWORD ──────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    // Always respond with success — never reveal if email exists
    if (!user) return;

    // Generate a cryptographically secure one-use token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepo.update(user.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    });

    // Store in Redis as well (faster lookup, auto-expires)
    await this.redis.set(`reset:${token}`, user.id, 'EX', 3600);

    // TODO: queue email via BullMQ — for now log for development
    console.log(`Password reset link: /reset-password?token=${token}`);
  }

  // ── RESET PASSWORD ───────────────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await this.redis.get(`reset:${token}`);
    if (!userId) throw new BadRequestException('Reset link is invalid or has expired');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.resetToken !== token) {
      throw new BadRequestException('Invalid reset token');
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Reset link has expired');
    }

    // Update password — @BeforeUpdate in entity will hash it
    await this.userRepo.update(user.id, {
      password: newPassword,
      resetToken: null as any,
      resetTokenExpiry: null as any,
      refreshTokenHash: null as any, // invalidate all sessions
    });

    // Remove from Redis
    await this.redis.del(`reset:${token}`);
  }

  // ── GET ME ───────────────────────────────────────────────────────────────
  async getMe(userId: string): Promise<LoginResponse> {
    const user = await this.userRepo.findOne({
      where: { id: userId }
    });
    if (!user) throw new UnauthorizedException('User not found');

    // Find all navigation items for user's role
    const navItems = await this.navItemRepo.find();

    const currentModules = navItems?.filter(item => item.roles?.includes(user.role)) || [];

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      ...currentModules && ({ modules: currentModules })
    };
  }

  // ── PRIVATE: Issue Token Pair ────────────────────────────────────────────
  private async issueTokens(user: User): Promise<AuthTokens & { refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Sign access token (short-lived — 15 min)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.ACCESS_SECRET,
      expiresIn: this.ACCESS_EXPIRES,
    });

    // Sign refresh token (long-lived — 7 days)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.REFRESH_SECRET,
      expiresIn: this.REFRESH_EXPIRES,
    });

    // Store HASH of refresh token — if DB is leaked, tokens are still useless
    const refreshHash = await bcrypt.hash(refreshToken, this.BCRYPT_ROUNDS);
    await this.userRepo.update(user.id, { refreshTokenHash: refreshHash });

    // Calculate exact expiry timestamp for Angular
    const decoded = this.jwtService.decode<JwtPayload>(accessToken);

    return {
      accessToken,
      accessExpires: decoded?.exp || Math.floor(Date.now() / 1000) + 900,
      refreshToken, // sent as httpOnly cookie — never to client JS
    };
  }
}
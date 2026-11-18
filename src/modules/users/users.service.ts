import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import type { User } from '../../generated/prisma/client.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

export type PublicUser = Pick<
  User,
  'id' | 'email' | 'role' | 'createdAt' | 'updatedAt'
>;

const PROVISIONING_RIGHTS: Record<Role, Role[]> = {
  [Role.ADMIN]: [Role.STAFF, Role.CUSTOMER],
  [Role.STAFF]: [Role.CUSTOMER],
  [Role.CUSTOMER]: [],
};

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findMany(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.toPublicUser(user));
  }

  async createUser(
    actor: PublicUser,
    targetRole: Role,
    dto: CreateUserDto,
  ): Promise<PublicUser> {
    if (!PROVISIONING_RIGHTS[actor.role].includes(targetRole)) {
      throw new ForbiddenException(
        `${actor.role} cannot create ${targetRole} accounts`,
      );
    }

    const email = dto.email.trim().toLowerCase();

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
          role: targetRole,
          createdById: actor.id,
        },
      });
      return this.toPublicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}

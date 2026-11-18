import { BadRequestException, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma, Role } from '../../generated/prisma/client.js';
import type {
  AccountStatus,
  BankAccount,
} from '../../generated/prisma/client.js';
import type { PublicUser } from '../users/users.service.js';
import type { CreateAccountDto } from './dto/create-account.dto.js';

export type PublicAccount = {
  id: string;
  accountNumber: string;
  customerId: string;
  balanceMinor: string;
  status: AccountStatus;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const ACCOUNT_NUMBER_LENGTH = 10;
const ACCOUNT_NUMBER_ATTEMPTS = 5;

function generateAccountNumber(): string {
  return randomInt(0, 10 ** ACCOUNT_NUMBER_LENGTH)
    .toString()
    .padStart(ACCOUNT_NUMBER_LENGTH, '0');
}

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  toPublicAccount(account: BankAccount): PublicAccount {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      customerId: account.customerId,
      balanceMinor: account.balanceMinor.toString(),
      status: account.status,
      createdById: account.createdById,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async create(
    actor: PublicUser,
    dto: CreateAccountDto,
  ): Promise<PublicAccount> {
    const customer = await this.prisma.user.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new BadRequestException(
        'customerId must identify an existing CUSTOMER account',
      );
    }

    const balanceMinor = BigInt(dto.openingBalanceMinor ?? '0');

    for (let attempt = 0; attempt < ACCOUNT_NUMBER_ATTEMPTS; attempt++) {
      try {
        const account = await this.prisma.bankAccount.create({
          data: {
            accountNumber: generateAccountNumber(),
            customerId: customer.id,
            balanceMinor,
            createdById: actor.id,
          },
        });
        return this.toPublicAccount(account);
      } catch (error) {
        const isDuplicate =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002';

        if (!isDuplicate || attempt === ACCOUNT_NUMBER_ATTEMPTS - 1) {
          throw error;
        }
      }
    }

    throw new Error('Unable to generate a unique account number');
  }

  async findAll(customerId?: string): Promise<PublicAccount[]> {
    const accounts = await this.prisma.bankAccount.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return accounts.map((account) => this.toPublicAccount(account));
  }
}

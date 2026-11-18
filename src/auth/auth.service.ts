import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './strategies/jwt.strategy.js';

/** Placeholder for the eventual login/register flow. */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  signToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: '0f9eb0b1-6ea0-4ef1-a595-b8c49e0c48dc',
    description: 'Id of the CUSTOMER who owns the account',
  })
  @IsUUID()
  customerId!: string;

  @ApiPropertyOptional({
    example: '0',
    description: 'Opening balance in minor units (e.g. 150000 = 1,500.00)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, {
    message: 'openingBalanceMinor must be a non-negative integer string',
  })
  @MaxLength(19)
  openingBalanceMinor?: string;
}

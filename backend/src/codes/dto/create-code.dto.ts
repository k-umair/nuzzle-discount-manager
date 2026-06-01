import { IsString, IsNotEmpty, IsIn, IsNumber, IsPositive, IsDateString, IsInt, Min } from 'class-validator';

export class CreateCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsIn(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  @IsPositive()
  discountValue: number;

  @IsDateString()
  expiryDate: string;

  @IsInt()
  @Min(1)
  usageLimit: number;

  @IsString()
  @IsNotEmpty()
  campaign: string;
}

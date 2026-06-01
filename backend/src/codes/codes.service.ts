import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DiscountCode, DiscountCodeWithStatus, CodeStatus } from './interfaces/discount-code.interface';
import { CreateCodeDto } from './dto/create-code.dto';

@Injectable()
export class CodesService {
  private readonly store = new Map<string, DiscountCode>();

  private computeStatus(code: DiscountCode): CodeStatus {
    if (new Date() > new Date(code.expiryDate)) return 'expired';
    if (code.usageCount >= code.usageLimit) return 'exhausted';
    return 'active';
  }

  private withStatus(code: DiscountCode): DiscountCodeWithStatus {
    return { ...code, status: this.computeStatus(code) };
  }

  create(dto: CreateCodeDto): DiscountCodeWithStatus {
    const upperCode = dto.code.toUpperCase();
    const duplicate = Array.from(this.store.values()).some((c) => c.code === upperCode);
    if (duplicate) throw new BadRequestException(`Code "${upperCode}" already exists`);

    const code: DiscountCode = {
      id: uuidv4(),
      code: upperCode,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      expiryDate: dto.expiryDate,
      usageLimit: dto.usageLimit,
      usageCount: 0,
      campaign: dto.campaign,
      createdAt: new Date().toISOString(),
    };
    this.store.set(code.id, code);
    return this.withStatus(code);
  }

  findAll(): DiscountCodeWithStatus[] {
    return Array.from(this.store.values()).map((c) => this.withStatus(c));
  }

  findOne(id: string): DiscountCodeWithStatus {
    const code = this.store.get(id);
    if (!code) throw new NotFoundException(`Code with id ${id} not found`);
    return this.withStatus(code);
  }

  redeem(id: string): DiscountCodeWithStatus {
    const code = this.store.get(id);
    if (!code) throw new NotFoundException(`Code with id ${id} not found`);

    if (new Date() > new Date(code.expiryDate)) {
      throw new BadRequestException('Code is expired');
    }
    if (code.usageCount >= code.usageLimit) {
      throw new BadRequestException('Usage limit reached');
    }

    code.usageCount += 1;
    this.store.set(id, code);
    return this.withStatus(code);
  }

  getSummary() {
    const all = Array.from(this.store.values());
    const byCampaign = new Map<string, DiscountCode[]>();

    for (const code of all) {
      const group = byCampaign.get(code.campaign) ?? [];
      group.push(code);
      byCampaign.set(code.campaign, group);
    }

    const campaigns = Array.from(byCampaign.entries()).map(([campaign, codes]) => ({
      campaign,
      totalCodes: codes.length,
      totalRedemptions: codes.reduce((sum, c) => sum + c.usageCount, 0),
      activeCodes: codes.filter((c) => this.computeStatus(c) === 'active').length,
    }));

    return { campaigns };
  }
}

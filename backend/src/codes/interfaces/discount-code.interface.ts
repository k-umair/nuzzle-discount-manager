export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  campaign: string;
  createdAt: string;
}

export type CodeStatus = 'active' | 'expired' | 'exhausted';

export interface DiscountCodeWithStatus extends DiscountCode {
  status: CodeStatus;
}

export type DiscountType = 'percentage' | 'fixed';
export type CodeStatus = 'active' | 'expired' | 'exhausted';

export interface DiscountCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  campaign: string;
  createdAt: string;
  status: CodeStatus;
}

export interface CampaignSummary {
  campaign: string;
  totalCodes: number;
  totalRedemptions: number;
  activeCodes: number;
}

export interface SummaryResponse {
  campaigns: CampaignSummary[];
}

export interface CreateCodePayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  campaign: string;
}

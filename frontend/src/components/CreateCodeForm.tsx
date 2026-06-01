import { useState, FormEvent } from 'react';
import { createCode } from '../api/codes';
import { CreateCodePayload } from '../types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const empty: CreateCodePayload = {
  code: '',
  discountType: 'percentage',
  discountValue: 0,
  expiryDate: '',
  usageLimit: 1,
  campaign: '',
};

interface Props {
  onCreated: () => void;
}

export function CreateCodeForm({ onCreated }: Props) {
  const [form, setForm] = useState<CreateCodePayload>(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CreateCodePayload>(key: K, value: CreateCodePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCodeChange(raw: string) {
    // Strip spaces, uppercase, enforce 20-char max
    set('code', raw.replace(/\s/g, '').toUpperCase().slice(0, 20));
  }

  function handleValueChange(raw: string) {
    const num = parseFloat(raw);
    if (isNaN(num)) { set('discountValue', 0); return; }
    if (form.discountType === 'percentage') {
      set('discountValue', Math.min(num, 100));
    } else {
      set('discountValue', num);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.discountType === 'percentage' && form.discountValue > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createCode(form);
      toast.success(`Code "${form.code}" created successfully`);
      setForm(empty);
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Code */}
        <div className="space-y-1.5">
          <Label htmlFor="code">
            Code
            <span className="text-muted-foreground font-normal ml-1 text-xs">
              ({form.code.length}/20)
            </span>
          </Label>
          <Input
            id="code"
            required
            placeholder="SUMMER20"
            value={form.code}
            maxLength={20}
            onChange={(e) => handleCodeChange(e.target.value)}
          />
        </div>

        {/* Discount Type */}
        <div className="space-y-1.5">
          <Label>Discount Type</Label>
          <Select
            value={form.discountType}
            onValueChange={(v) => {
              set('discountType', v as 'percentage' | 'fixed');
              // Re-clamp value if switching to percentage
              if (v === 'percentage' && form.discountValue > 100) {
                set('discountValue', 100);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Value */}
        <div className="space-y-1.5">
          <Label htmlFor="value">
            Discount Value{' '}
            <span className="text-muted-foreground font-normal">
              ({form.discountType === 'percentage' ? `max 100%` : '$'})
            </span>
          </Label>
          <Input
            id="value"
            type="number"
            required
            min={0.01}
            max={form.discountType === 'percentage' ? 100 : undefined}
            step={0.01}
            placeholder={form.discountType === 'percentage' ? '20' : '10.00'}
            value={form.discountValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        </div>

        {/* Expiry Date */}
        <div className="space-y-1.5">
          <Label htmlFor="expiry">Expiry Date</Label>
          <Input
            id="expiry"
            type="date"
            required
            min={tomorrow}
            value={form.expiryDate}
            onChange={(e) => set('expiryDate', e.target.value)}
          />
        </div>

        {/* Usage Limit */}
        <div className="space-y-1.5">
          <Label htmlFor="limit">Usage Limit</Label>
          <Input
            id="limit"
            type="number"
            required
            min={1}
            step={1}
            placeholder="100"
            value={form.usageLimit || ''}
            onChange={(e) => set('usageLimit', parseInt(e.target.value, 10))}
          />
        </div>

        {/* Campaign */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign">Campaign</Label>
          <Input
            id="campaign"
            required
            placeholder="Black Friday"
            value={form.campaign}
            onChange={(e) => set('campaign', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating…' : 'Create Code'}
      </Button>
    </form>
  );
}

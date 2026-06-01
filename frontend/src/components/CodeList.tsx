import { useState } from 'react';
import { redeemCode } from '../api/codes';
import { DiscountCode, CodeStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { CreateCodeForm } from './CreateCodeForm';
import { PlusCircle, TicketPercent } from 'lucide-react';

interface Props {
  codes: DiscountCode[];
  onRedeemed: () => void;
  onCreated: () => void;
}

const statusClass: Record<CodeStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-100 text-slate-500 border-slate-200',
  exhausted: 'bg-red-50 text-red-700 border-red-200',
};

export function CodeList({ codes, onRedeemed, onCreated }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleRedeem(id: string) {
    setLoadingId(id);
    setErrors((prev) => ({ ...prev, [id]: '' }));
    try {
      await redeemCode(id);
      onRedeemed();
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : 'Failed' }));
    } finally {
      setLoadingId(null);
    }
  }

  function handleCreated() {
    setDialogOpen(false);
    onCreated();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-blue-600" />
            Discount Codes
            {codes.length > 0 && (
              <Badge variant="secondary" className="ml-1 font-mono">
                {codes.length}
              </Badge>
            )}
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Code
          </Button>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
              <TicketPercent className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">No codes yet.</p>
              <Button variant="link" size="sm" className="mt-1" onClick={() => setDialogOpen(true)}>
                Create your first code
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-semibold tracking-wide">{c.code}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{c.discountType}</TableCell>
                    <TableCell className="font-medium">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.expiryDate}</TableCell>
                    <TableCell>
                      <span className={c.usageCount >= c.usageLimit ? 'text-red-600 font-semibold' : ''}>
                        {c.usageCount}
                      </span>
                      <span className="text-muted-foreground"> / {c.usageLimit}</span>
                    </TableCell>
                    <TableCell>{c.campaign}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[c.status]}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {errors[c.id] && (
                          <span className="text-xs text-red-600 max-w-[120px] truncate">{errors[c.id]}</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={c.status !== 'active' || loadingId === c.id}
                          onClick={() => handleRedeem(c.id)}
                        >
                          {loadingId === c.id ? '…' : 'Redeem'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Discount Code</DialogTitle>
            <DialogDescription>
              Add a new promotional code to a campaign.
            </DialogDescription>
          </DialogHeader>
          <CreateCodeForm onCreated={handleCreated} />
        </DialogContent>
      </Dialog>
    </>
  );
}

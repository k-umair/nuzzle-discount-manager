import { CampaignSummary } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart3 } from 'lucide-react';

interface Props {
  campaigns: CampaignSummary[];
}

export function UsageSummary({ campaigns }: Props) {
  const totalCodes = campaigns.reduce((s, c) => s + c.totalCodes, 0);
  const totalRedemptions = campaigns.reduce((s, c) => s + c.totalRedemptions, 0);
  const totalActive = campaigns.reduce((s, c) => s + c.activeCodes, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Usage Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Aggregate stat tiles */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-slate-50 px-4 py-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Total Codes</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{totalCodes}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 px-4 py-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Redemptions</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{totalRedemptions}</p>
          </div>
          <div className="rounded-lg border bg-emerald-50 border-emerald-100 px-4 py-3">
            <p className="text-[11px] text-emerald-600 uppercase tracking-widest font-semibold">Active</p>
            <p className="text-3xl font-bold mt-1 tabular-nums text-emerald-700">{totalActive}</p>
          </div>
        </div>

        {/* Per-campaign breakdown */}
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No campaign data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Total Codes</TableHead>
                <TableHead className="text-right">Redemptions</TableHead>
                <TableHead className="text-right">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.campaign}>
                  <TableCell className="font-medium">{c.campaign}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.totalCodes}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.totalRedemptions}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={c.activeCodes > 0 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}>
                      {c.activeCodes}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

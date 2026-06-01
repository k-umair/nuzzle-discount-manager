import { useEffect, useState, useCallback } from 'react';
import { getCodes, getSummary } from './api/codes';
import { DiscountCode, CampaignSummary } from './types';
import { CodeList } from './components/CodeList';
import { UsageSummary } from './components/UsageSummary';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Tag } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [codesData, summaryData] = await Promise.all([getCodes(), getSummary()]);
      setCodes(codesData);
      setCampaigns(summaryData.campaigns);
      setFetchError(null);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster richColors position="top-right" />
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Nuzzle</p>
            <h1 className="text-lg font-semibold leading-tight tracking-tight">Discount Code Manager</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {fetchError && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span className="font-medium">Error:</span> {fetchError}
          </div>
        )}

        <Tabs defaultValue="codes">
          <TabsList>
            <TabsTrigger value="codes">Discount Codes</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="codes">
            <CodeList codes={codes} onRedeemed={refresh} onCreated={refresh} />
          </TabsContent>

          <TabsContent value="summary">
            <UsageSummary campaigns={campaigns} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

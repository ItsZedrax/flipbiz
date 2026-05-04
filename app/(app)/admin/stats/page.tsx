import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Receipt,
  HardDrive,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} Go`;
}

async function computeStorageUsage(
  admin: ReturnType<typeof createAdminClient>,
): Promise<{ count: number; size: number }> {
  let count = 0;
  let size = 0;

  // Walk per-user folders inside the article-photos bucket.
  const { data: roots } = await admin.storage
    .from("article-photos")
    .list("", { limit: 1000 });

  for (const root of roots ?? []) {
    if (!root.id && root.name) {
      // It's a folder.
      const { data: files } = await admin.storage
        .from("article-photos")
        .list(root.name, { limit: 1000 });
      for (const f of files ?? []) {
        count += 1;
        const s = (f.metadata as { size?: number } | null)?.size ?? 0;
        size += s;
      }
    } else {
      count += 1;
      const s = (root.metadata as { size?: number } | null)?.size ?? 0;
      size += s;
    }
  }
  return { count, size };
}

export default async function AdminStatsPage() {
  const admin = createAdminClient();

  const [
    profilesRes,
    pendingRes,
    articlesRes,
    purchasesRes,
    salesRes,
    expensesRes,
    salesAggRes,
    storage,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_approved", false)
      .eq("is_admin", false),
    admin.from("articles").select("id", { count: "exact", head: true }),
    admin.from("purchases").select("id", { count: "exact", head: true }),
    admin.from("sales").select("id", { count: "exact", head: true }),
    admin.from("expenses").select("id", { count: "exact", head: true }),
    admin.from("sales").select("sale_price, platform_fees_amount"),
    computeStorageUsage(admin),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const pendingUsers = pendingRes.count ?? 0;
  const totalArticles = articlesRes.count ?? 0;
  const totalPurchases = purchasesRes.count ?? 0;
  const totalSales = salesRes.count ?? 0;
  const totalExpenses = expensesRes.count ?? 0;

  const grossRevenue = (salesAggRes.data ?? []).reduce(
    (sum, s) => sum + Number(s.sale_price ?? 0),
    0,
  );
  const fees = (salesAggRes.data ?? []).reduce(
    (sum, s) => sum + Number(s.platform_fees_amount ?? 0),
    0,
  );
  const netRevenue = grossRevenue - fees;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Utilisateurs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={Users}
            label="Utilisateurs totaux"
            value={totalUsers.toString()}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Approuvés"
            value={(totalUsers - pendingUsers).toString()}
            tone="success"
          />
          <MetricCard
            icon={Clock}
            label="En attente"
            value={pendingUsers.toString()}
            tone="warning"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Activité</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Package}
            label="Articles"
            value={totalArticles.toString()}
          />
          <MetricCard
            icon={ShoppingCart}
            label="Achats"
            value={totalPurchases.toString()}
          />
          <MetricCard
            icon={TrendingUp}
            label="Ventes"
            value={totalSales.toString()}
            tone="success"
          />
          <MetricCard
            icon={Receipt}
            label="Dépenses"
            value={totalExpenses.toString()}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Chiffre d&apos;affaires global
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={TrendingUp}
            label="CA brut cumulé"
            value={formatCurrency(grossRevenue)}
            tone="success"
          />
          <MetricCard
            icon={Receipt}
            label="Frais cumulés"
            value={formatCurrency(fees)}
          />
          <MetricCard
            icon={TrendingUp}
            label="CA net cumulé"
            value={formatCurrency(netRevenue)}
            tone="success"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Storage</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard
            icon={HardDrive}
            label="Photos uploadées"
            value={storage.count.toString()}
          />
          <MetricCard
            icon={HardDrive}
            label="Espace utilisé"
            value={formatBytes(storage.size)}
            hint="Bucket article-photos"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Pour les requêtes DB et les erreurs runtime, va sur le dashboard
          Supabase et Vercel (Logs / Reports).
        </p>
      </section>
    </div>
  );
}

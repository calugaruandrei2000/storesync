import { useDashboardStats } from "@/hooks/use-dashboard";
import { Shell } from "@/components/layout/Shell";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  Truck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatsCard({ title, value, icon: Icon, description, loading }: any) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold font-display">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <Shell title="Panou">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Venituri Totale"
          value={`${stats?.totalRevenue || "0.00"} RON`}
          icon={DollarSign}
          description="Din toate magazinele conectate"
          loading={isLoading}
        />
        <StatsCard
          title="Total Comenzi"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          description="Procesate luna aceasta"
          loading={isLoading}
        />
        <StatsCard
          title="Produse"
          value={stats?.productsCount || 0}
          icon={Package}
          description="SKU-uri active"
          loading={isLoading}
        />
        <StatsCard
          title="Expedieri în Așteptare"
          value={stats?.pendingShipments || 0}
          icon={Truck}
          description="Comenzi de procesat"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4 border-border/60">
          <CardHeader>
            <CardTitle>Prezentare Generală</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-md bg-muted/20">
              Grafic de vânzări (în dezvoltare)
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-border/60">
          <CardHeader>
            <CardTitle>Alerte Stoc Scăzut</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.lowStockCount === 0 ? (
                  <p className="text-sm text-muted-foreground">Nu există alerte de stoc.</p>
                ) : (
                  <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{stats?.lowStockCount} produse cu stoc scăzut</p>
                      <p className="text-xs opacity-90">Verifică inventarul pentru reaprovizionare.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

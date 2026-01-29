import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Package, Search, RefreshCw, Edit2, AlertTriangle, 
  TrendingDown, TrendingUp, Loader2
} from "lucide-react";
import type { Product } from "@shared/schema";

export default function Inventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState("");

  const { data: productsData, isLoading } = useQuery<{ items: Product[], total: number }>({
    queryKey: ["/api/products"],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
      return apiRequest(`/api/products/${id}/stock`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Stoc actualizat", description: "Cantitatea a fost modificată cu succes" });
      setEditProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    },
  });

  const products = productsData?.items || [];
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 10);
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0);

  const getStockBadge = (qty: number) => {
    if (qty === 0) return <Badge variant="destructive">Stoc epuizat</Badge>;
    if (qty < 10) return <Badge variant="outline" className="text-orange-600 border-orange-300">Stoc scăzut</Badge>;
    return <Badge variant="secondary" className="text-green-700">În stoc</Badge>;
  };

  const handleSaveStock = () => {
    if (editProduct && newStock) {
      updateStockMutation.mutate({ id: editProduct.id, quantity: parseInt(newStock) });
    }
  };

  return (
    <Shell title="Inventar">
      <div className="space-y-6">
        <p className="text-muted-foreground -mt-4">Gestionează stocurile produselor tale</p>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produse</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stoc Scăzut</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stoc Epuizat</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Produse</CardTitle>
                <CardDescription>Lista completă a produselor din magazine</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Caută produs sau SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-products"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nu există produse</p>
                <p className="text-sm">Sincronizează un magazin pentru a vedea produsele</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produs</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Preț</TableHead>
                    <TableHead className="text-center">Stoc</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                      <TableCell className="text-right">{product.price} RON</TableCell>
                      <TableCell className="text-center font-mono">{product.stockQuantity}</TableCell>
                      <TableCell className="text-center">
                        {getStockBadge(product.stockQuantity || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditProduct(product);
                            setNewStock(String(product.stockQuantity || 0));
                          }}
                          data-testid={`button-edit-stock-${product.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizare Stoc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Produs: <span className="font-medium text-foreground">{editProduct?.name}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="stock">Cantitate nouă</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                data-testid="input-new-stock"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Anulează</Button>
            <Button 
              onClick={handleSaveStock} 
              disabled={updateStockMutation.isPending}
              data-testid="button-save-stock"
            >
              {updateStockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

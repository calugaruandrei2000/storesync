import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useStores, useCreateStore, useDeleteStore, useSyncStore } from "@/hooks/use-stores";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, RefreshCw, Store as StoreIcon, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoreSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";

function AddStoreDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateStore();
  
  const form = useForm({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      type: "woocommerce",
      url: "",
      apiKey: "",
      apiSecret: "",
    },
  });

  function onSubmit(data: any) {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40">
          <Plus className="h-4 w-4" /> Adaugă Magazin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conectează Magazin Nou</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume Magazin</FormLabel>
                  <FormControl><Input placeholder="Magazinul Meu" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platformă</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează platforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="woocommerce">WooCommerce</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="magento">Magento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Magazin</FormLabel>
                  <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cheie API</FormLabel>
                  <FormControl><Input type="password" placeholder="Ck_xxxxxxxx" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret API</FormLabel>
                  <FormControl><Input type="password" placeholder="Cs_xxxxxxxx" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Se conectează..." : "Conectează Magazin"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Stores() {
  const { data: stores, isLoading } = useStores();
  const deleteStore = useDeleteStore();
  const syncStore = useSyncStore();

  return (
    <Shell title="Magazine">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Gestionează platformele e-commerce conectate.</p>
        <AddStoreDialog />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : stores?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Niciun magazin conectat</h3>
          <p className="text-muted-foreground mt-2">Conectează primul tău magazin pentru a începe.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores?.map((store) => (
            <Card key={store.id} className="group hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-display">{store.name}</CardTitle>
                  <CardDescription className="capitalize flex items-center gap-1">
                    {store.type}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </CardDescription>
                </div>
                <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                  <StoreIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge 
                    status={store.status || "active"} 
                    type={store.status === 'active' ? 'success' : 'error'} 
                  />
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Ultima Sincronizare</span>
                  <span>
                    {store.lastSyncAt 
                      ? format(new Date(store.lastSyncAt), 'd MMM, HH:mm') 
                      : 'Niciodată'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover:bg-white hover:text-primary hover:border-primary/30"
                  onClick={() => syncStore.mutate(store.id)}
                  disabled={syncStore.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncStore.isPending ? 'animate-spin' : ''}`} />
                  Sincronizează
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Ești sigur că vrei să ștergi acest magazin?")) {
                      deleteStore.mutate(store.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}

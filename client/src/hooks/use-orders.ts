import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOrders(params?: { storeId?: number; status?: string; page?: number }) {
  return useQuery({
    queryKey: [api.orders.list.path, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.storeId) queryParams.set("storeId", params.storeId.toString());
      if (params?.status) queryParams.set("status", params.status);
      if (params?.page) queryParams.set("page", params.page.toString());

      const res = await fetch(`${api.orders.list.path}?${queryParams.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateAwb() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, courier }: { orderId: number; courier: "fancourier" | "sameday" | "gls" }) => {
      const url = buildUrl(api.orders.generateAwb.path, { id: orderId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate AWB");
      return api.orders.generateAwb.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "AWB Generated", description: "Shipping label created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not generate AWB", variant: "destructive" });
    },
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, provider }: { orderId: number; provider: "smartbill" | "oblio" }) => {
      const url = buildUrl(api.orders.generateInvoice.path, { id: orderId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate Invoice");
      return api.orders.generateInvoice.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Invoice Generated", description: "Invoice created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not generate invoice", variant: "destructive" });
    },
  });
}

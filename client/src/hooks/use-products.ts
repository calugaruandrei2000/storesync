import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useProducts(params?: { storeId?: number; search?: string; page?: number }) {
  return useQuery({
    queryKey: [api.products.list.path, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.storeId) queryParams.set("storeId", params.storeId.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.page) queryParams.set("page", params.page.toString());

      const res = await fetch(`${api.products.list.path}?${queryParams.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

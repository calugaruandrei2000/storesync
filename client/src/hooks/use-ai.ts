import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAiConfig(storeId: number) {
  return useQuery({
    queryKey: [api.ai.config.path, storeId],
    queryFn: async () => {
      const url = buildUrl(api.ai.config.path, { storeId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch AI config");
      return api.ai.config.responses[200].parse(await res.json());
    },
    enabled: !!storeId,
  });
}

export function useUpdateAiConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storeId, ...data }: { storeId: number; enabled: boolean; provider: string; model: string }) => {
      const url = buildUrl(api.ai.updateConfig.path, { storeId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update AI config");
      return api.ai.updateConfig.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.ai.config.path, variables.storeId] });
      toast({ title: "Settings Saved", description: "AI configuration updated" });
    },
  });
}

import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useStores } from "@/hooks/use-stores";
import { useAiConfig, useUpdateAiConfig } from "@/hooks/use-ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";

function AiConfigCard({ store }: { store: any }) {
  const { data: config, isLoading } = useAiConfig(store.id);
  const updateConfig = useUpdateAiConfig();
  
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");

  // Sync local state with fetched data once loaded
  if (!isLoading && config && enabled !== config.enabled) {
    setEnabled(config.enabled ?? false);
    setProvider(config.provider || "openai");
    setModel(config.model || "gpt-4o");
  }

  const handleSave = () => {
    updateConfig.mutate({
      storeId: store.id,
      enabled,
      provider,
      model,
    });
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>AI Configuration</CardDescription>
            </div>
          </div>
          <Switch 
            checked={enabled} 
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={setProvider} disabled={!enabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel} disabled={!enabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Capabilities
          </h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Auto-generate product descriptions</li>
            <li>Analyze sales trends and predict inventory needs</li>
            <li>Suggest pricing optimizations</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateConfig.isPending || !enabled}>
            {updateConfig.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AiLayer() {
  const { data: stores, isLoading } = useStores();

  return (
    <Shell title="AI Layer">
      <div className="max-w-4xl">
        <p className="text-muted-foreground mb-8">
          Configure AI agents to autonomously manage your stores. Enable providers and set models per store.
        </p>

        <div className="space-y-6">
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          ) : stores?.map((store) => (
            <AiConfigCard key={store.id} store={store} />
          ))}
        </div>
      </div>
    </Shell>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, Download, ExternalLink, CheckCircle, 
  Clock, XCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface Invoice {
  id: number;
  invoiceNumber: string;
  series: string;
  provider: string;
  status: string;
  url: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    customerName: string;
    total: string;
    currency: string;
  };
}

export default function Invoices() {
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Emisă</Badge>;
      case 'draft':
        return <Badge variant="outline">Ciornă</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Anulată</Badge>;
      case 'failed':
        return <Badge variant="destructive">Eșuată</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      smartbill: 'SmartBill',
      oblio: 'Oblio',
    };
    return labels[provider] || provider;
  };

  const stats = {
    total: invoices.length,
    issued: invoices.filter(i => i.status === 'issued').length,
    draft: invoices.filter(i => i.status === 'draft').length,
    totalValue: invoices
      .filter(i => i.order)
      .reduce((sum, i) => sum + parseFloat(i.order?.total || '0'), 0),
  };

  return (
    <Shell title="Facturi">
      <div className="space-y-6">
        <p className="text-muted-foreground -mt-4">Gestionează facturile emise automat</p>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emise</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ciorne</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valoare Totală</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalValue.toFixed(2)} RON</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista Facturi</CardTitle>
            <CardDescription>Toate facturile generate automat din comenzi</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nu există facturi</p>
                <p className="text-sm">Generează o factură din pagina Comenzi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Număr Factură</TableHead>
                    <TableHead>Comandă</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Furnizor</TableHead>
                    <TableHead className="text-right">Valoare</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono font-medium">
                        {invoice.series}{invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.order?.orderNumber || "-"}</TableCell>
                      <TableCell>{invoice.order?.customerName || "-"}</TableCell>
                      <TableCell>{getProviderLabel(invoice.provider)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {invoice.order?.total || "0"} {invoice.order?.currency || "RON"}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: ro })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(invoice.url, '_blank')}
                          data-testid={`button-download-invoice-${invoice.id}`}
                        >
                          <Download className="h-4 w-4" />
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
    </Shell>
  );
}

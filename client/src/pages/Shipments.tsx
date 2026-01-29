import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Truck, Package, MapPin, Clock, CheckCircle2, 
  XCircle, Loader2, Eye, FileText
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface Shipment {
  id: number;
  awbNumber: string;
  courier: string;
  status: string;
  pdfUrl: string;
  trackingHistory: Array<{ status: string; message?: string; timestamp: string }>;
  createdAt: string;
  order?: {
    orderNumber: string;
    customerName: string;
    customerAddress: any;
  };
}

export default function Shipments() {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const { data: shipments = [], isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="outline">Generat</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Expediat</Badge>;
      case 'in_transit':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">În tranzit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Livrat</Badge>;
      case 'failed':
        return <Badge variant="destructive">Eșuat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCourierLabel = (courier: string) => {
    const labels: Record<string, string> = {
      fancourier: 'FAN Courier',
      sameday: 'Sameday',
      gls: 'GLS',
    };
    return labels[courier] || courier;
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'generated').length,
    inTransit: shipments.filter(s => ['shipped', 'in_transit'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  return (
    <Shell title="Expedieri">
      <div className="space-y-6">
        <p className="text-muted-foreground -mt-4">Monitorizează toate AWB-urile și statusul livrărilor</p>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total AWB-uri</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">De expediat</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">În tranzit</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Shipments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista Expedieri</CardTitle>
            <CardDescription>Toate AWB-urile generate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nu există expedieri</p>
                <p className="text-sm">Generează un AWB din pagina Comenzi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AWB</TableHead>
                    <TableHead>Comandă</TableHead>
                    <TableHead>Curier</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono font-medium">{shipment.awbNumber}</TableCell>
                      <TableCell>{shipment.order?.orderNumber || "-"}</TableCell>
                      <TableCell>{getCourierLabel(shipment.courier)}</TableCell>
                      <TableCell>{shipment.order?.customerName || "-"}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(shipment.createdAt), "d MMM yyyy", { locale: ro })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedShipment(shipment)}
                          data-testid={`button-view-shipment-${shipment.id}`}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Tracking Dialog */}
      <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tracking AWB: {selectedShipment?.awbNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedShipment && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Curier</span>
                <span className="font-medium">{getCourierLabel(selectedShipment.courier)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedShipment.status)}
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Istoric tracking</h4>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {(selectedShipment.trackingHistory || []).map((event, i) => (
                      <div key={i} className="relative pl-8">
                        <div className={`absolute left-0 w-4 h-4 rounded-full border-2 ${
                          i === 0 ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'
                        }`} />
                        <div>
                          <p className="text-sm font-medium capitalize">{event.status}</p>
                          {event.message && (
                            <p className="text-xs text-muted-foreground">{event.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.timestamp), "d MMM yyyy, HH:mm", { locale: ro })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedShipment.order?.customerAddress && (
                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">{selectedShipment.order.customerName}</p>
                      <p className="text-muted-foreground">
                        {selectedShipment.order.customerAddress.street}<br />
                        {selectedShipment.order.customerAddress.city}, {selectedShipment.order.customerAddress.county}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

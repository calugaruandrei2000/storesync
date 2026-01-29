import { Shell } from "@/components/layout/Shell";
import { useOrders, useGenerateAwb, useGenerateInvoice } from "@/hooks/use-orders";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Truck } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";

export default function Orders() {
  const { data, isLoading } = useOrders();
  const generateAwb = useGenerateAwb();
  const generateInvoice = useGenerateInvoice();

  return (
    <Shell title="Comenzi">
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr. Comandă</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="h-16"><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nu există comenzi.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    #{order.orderNumber}
                    <div className="text-xs text-muted-foreground">{order.remoteId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={order.status} 
                      type={
                        order.status === 'completed' ? 'success' : 
                        order.status === 'processing' ? 'info' : 
                        order.status === 'cancelled' ? 'error' : 'neutral'
                      } 
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(order.total).toLocaleString()} {order.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => generateAwb.mutate({ orderId: order.id, courier: "fancourier" })}>
                          <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                          Generează AWB (FAN)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => generateAwb.mutate({ orderId: order.id, courier: "sameday" })}>
                          <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                          Generează AWB (Sameday)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => generateInvoice.mutate({ orderId: order.id, provider: "smartbill" })}>
                          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                          Generează Factură
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Shell>
  );
}

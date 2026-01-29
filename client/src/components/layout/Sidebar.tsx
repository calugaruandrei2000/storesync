import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  Bot, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: 'Panou', href: '/', icon: LayoutDashboard },
  { name: 'Magazine', href: '/stores', icon: Store },
  { name: 'Inventar', href: '/inventory', icon: Package },
  { name: 'Comenzi', href: '/orders', icon: ShoppingCart },
  { name: 'Expedieri', href: '/shipments', icon: Truck },
  { name: 'Facturi', href: '/invoices', icon: Receipt },
  { name: 'Setări', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-card border-r w-64 fixed left-0 top-0 bottom-0 z-40">
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Bot className="h-8 w-8 text-primary mr-2" />
        <span className="font-display font-bold text-xl tracking-tight">StoreSync</span>
      </div>
      
      <div className="flex flex-1 flex-col gap-y-7 px-4 py-6 overflow-y-auto">
        <nav className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Profile" className="h-8 w-8 rounded-full border border-border" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {user?.firstName?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Delogare
        </button>
      </div>
    </div>
  );
}

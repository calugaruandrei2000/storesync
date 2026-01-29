import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Bell, Shield, Key, LogOut, 
  Save, Loader2, Building2, Mail
} from "lucide-react";

export default function Settings() {
  const { user, logout, isLoggingOut } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: user?.company || "",
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    deliveryUpdates: true,
    invoiceGenerated: false,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: "Profil salvat", description: "Modificările au fost salvate cu succes" });
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || user?.email?.[0] || "U";
    const last = user?.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  return (
    <Shell title="Setări">
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-muted-foreground -mt-4">Gestionează profilul și preferințele tale</p>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Profil</CardTitle>
                <CardDescription>Informațiile tale personale</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenume</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  data-testid="input-profile-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nume</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  data-testid="input-profile-lastname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-10"
                  data-testid="input-profile-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Companie</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="pl-10"
                  data-testid="input-profile-company"
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving} data-testid="button-save-profile">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvează modificările
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Notificări</CardTitle>
                <CardDescription>Configurează notificările pe email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Comenzi noi</p>
                <p className="text-sm text-muted-foreground">Primește notificare la fiecare comandă nouă</p>
              </div>
              <Switch
                checked={notifications.newOrders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
                data-testid="switch-notify-orders"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Stoc scăzut</p>
                <p className="text-sm text-muted-foreground">Alertă când stocul scade sub 10 unități</p>
              </div>
              <Switch
                checked={notifications.lowStock}
                onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                data-testid="switch-notify-stock"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Actualizări livrare</p>
                <p className="text-sm text-muted-foreground">Notificări despre statusul expedierilor</p>
              </div>
              <Switch
                checked={notifications.deliveryUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, deliveryUpdates: checked })}
                data-testid="switch-notify-delivery"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Facturi generate</p>
                <p className="text-sm text-muted-foreground">Notificare la emiterea unei facturi</p>
              </div>
              <Switch
                checked={notifications.invoiceGenerated}
                onCheckedChange={(checked) => setNotifications({ ...notifications, invoiceGenerated: checked })}
                data-testid="switch-notify-invoice"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Securitate</CardTitle>
                <CardDescription>Setări de securitate pentru cont</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Schimbă parola</p>
                <p className="text-sm text-muted-foreground">Actualizează parola contului tău</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-change-password">
                <Key className="mr-2 h-4 w-4" />
                Schimbă
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Delogare</p>
                <p className="text-sm text-muted-foreground">Ieși din contul curent</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                data-testid="button-logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Delogare
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

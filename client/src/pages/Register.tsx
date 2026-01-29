import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isRegistering, user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
  });

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Eroare",
        description: "Parolele nu coincid",
        variant: "destructive",
      });
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
      });
      toast({
        title: "Cont creat",
        description: "Bine ai venit la StoreSync Pro!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const features = [
    "Conectare magazine WooCommerce & Shopify",
    "Sincronizare automată stocuri",
    "Generare AWB & facturi",
    "Tracking comenzi în timp real",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-3 text-primary-foreground">
            <Store className="w-8 h-8" />
            <span className="text-xl font-bold">StoreSync Pro</span>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Gestionează toate magazinele tale dintr-un singur loc
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Platforma completă pentru e-commerce: sincronizare, comenzi, expedieri și facturare automată.
            </p>
          </div>
          
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-primary-foreground/60 text-sm">
          StoreSync Pro - Manager E-commerce
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">StoreSync Pro</h1>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Creează cont</CardTitle>
              <CardDescription>Completează datele pentru a începe</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prenume</Label>
                    <Input
                      id="firstName"
                      placeholder="Ion"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      data-testid="input-firstname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nume</Label>
                    <Input
                      id="lastName"
                      placeholder="Popescu"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      data-testid="input-lastname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Companie (opțional)</Label>
                  <Input
                    id="company"
                    placeholder="Numele companiei"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    data-testid="input-company"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplu.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Parolă</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minim 6 caractere"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="input-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmă parola</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repetă parola"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    data-testid="input-confirm-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isRegistering} data-testid="button-register">
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se creează contul...
                    </>
                  ) : (
                    <>
                      Creează cont
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Ai deja cont? </span>
                <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">
                  Autentifică-te
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

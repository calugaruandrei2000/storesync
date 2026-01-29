import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Store, 
  Package, 
  FileText, 
  Truck, 
  BarChart3, 
  Zap, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Store,
      title: "Multi-Store Management",
      description: "Conectează și gestionează magazine de pe WooCommerce, Shopify, Magento și PrestaShop dintr-un singur loc."
    },
    {
      icon: Truck,
      title: "Tracking AWB Automatizat",
      description: "Generare automată AWB pentru Fan Courier, Sameday și GLS. Tracking în timp real și descărcare etichete PDF."
    },
    {
      icon: FileText,
      title: "Facturare Inteligentă",
      description: "Integrare directă cu SmartBill și Oblio. Generare automată facturi la fiecare comandă nouă."
    },
    {
      icon: Package,
      title: "Gestiune Stocuri",
      description: "Sincronizare automată stocuri între magazine. Alert-uri pentru produse cu stoc mic."
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description: "Statistici în timp real, grafice vânzări, rapoarte detaliate și KPI-uri importante."
    },
    {
      icon: Sparkles,
      title: "AI Layer (Opțional)",
      description: "Analiză comenzi cu AI, predicții stocuri și recomandări optimizare powered by OpenAI/Claude."
    }
  ];

  const benefits = [
    "Economisește până la 10 ore/săptămână din timpul de management",
    "Reducere 80% din erorile manuale de procesare comenzi",
    "Tracking complet AWB în timp real pentru toți curierii",
    "Facturare automată 100% conformă legislație RO",
    "Sincronizare automată stocuri între toate magazinele",
    "Securitate enterprise: sesiuni criptate, hash parole, JWT tokens"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6">
            <Store className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Gestionează-ți magazinele online
            <span className="block text-primary mt-2">într-un singur loc</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Platformă SaaS completă pentru e-commerce: tracking AWB, facturare automată,
            sincronizare stocuri și analytics - totul optimizat pentru piața din România.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 group">
                Începe gratuit
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Autentificare
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>100% Securizat</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span>Setup în 5 minute</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Fără card necesar</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            De ce StoreSync Pro?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">Platforme Suportate</h3>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-bold text-purple-600">W</span>
              </div>
              <p className="text-sm font-medium">WooCommerce</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-bold text-green-600">S</span>
              </div>
              <p className="text-sm font-medium">Shopify</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-bold text-orange-600">M</span>
              </div>
              <p className="text-sm font-medium">Magento</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-bold text-blue-600">P</span>
              </div>
              <p className="text-sm font-medium">PrestaShop</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center text-white mt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gata să începi?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Alătură-te sutelor de magazine care își gestionează afacerea cu StoreSync Pro
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Creează cont gratuit
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 StoreSync Pro. Toate drepturile rezervate.</p>
          <p className="mt-2">Made with ❤️ for Romanian e-commerce</p>
        </div>
      </footer>
    </div>
  );
}

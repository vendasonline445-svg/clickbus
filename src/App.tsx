import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteProvider } from "@/contexts/SiteContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import OfferDetail from "./pages/OfferDetail";
import FunilMaosQueAcolhem from "./pages/FunilMaosQueAcolhem";
import SobreMaosQueAcolhem from "./pages/SobreMaosQueAcolhem";
import MaosCampanha from "./pages/MaosCampanha";
import FinalizacaoMaosQueAcolhem from "./pages/FinalizacaoMaosQueAcolhem";
import NotFound from "./pages/NotFound";
import CheckoutTemplate from "./pages/CheckoutTemplate";
import CheckoutPixPage from "./pages/CheckoutPixPage";
import CheckoutTemplate2 from "./pages/CheckoutTemplate2";
import CheckoutPixPage2 from "./pages/CheckoutPixPage2";
import ClickBusPage from "./pages/ClickBusPage";
import ClickBusResults from "./pages/ClickBusResults";
import ClickBusCheckout from "./pages/ClickBusCheckout";
import ClickBusPixPage from "./pages/ClickBusPixPage";
import ClickBusCardReview from "./pages/ClickBusCardReview";
import ClickBusAdmin from "./pages/ClickBusAdmin";
const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const fixPointerEvents = () => {
      if (document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "auto";
      }
    };

    fixPointerEvents();
    const observer = new MutationObserver(fixPointerEvents);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SiteProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<ClickBusPage />} />
                  <Route path="/resultados" element={<ClickBusResults />} />
                  <Route path="/checkout" element={<ClickBusCheckout />} />
                  <Route path="/pix" element={<ClickBusPixPage />} />
                  <Route path="/card-review" element={<ClickBusCardReview />} />
                  <Route path="/admin" element={<ClickBusAdmin />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SiteProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

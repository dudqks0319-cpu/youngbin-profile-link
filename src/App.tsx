import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import LinksManage from "./pages/LinksManage";
import CarouselManage from "./pages/CarouselManage";
import ProductsManage from "./pages/ProductsManage";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />

      {/* Admin routes */}
      <Route path={"/admin"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/profile"}>
        <DashboardLayout>
          <ProfileEdit />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/links"}>
        <DashboardLayout>
          <LinksManage />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/carousel"}>
        <DashboardLayout>
          <CarouselManage />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/products"}>
        <DashboardLayout>
          <ProductsManage />
        </DashboardLayout>
      </Route>

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

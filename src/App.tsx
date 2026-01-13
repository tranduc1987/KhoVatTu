import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public Pages
import Home from "./pages/public/Home";
import ProductList from "./pages/public/ProductList";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import StockReceipts from "./pages/admin/StockReceipts";
import ProductCreate from "./pages/admin/ProductCreate";
import ProductEdit from "./pages/admin/ProductEdit";
import Categories from "./pages/admin/Categories";
import Origins from "./pages/admin/Origins";
import ProductDetail from "./pages/admin/ProductDetail";
import StockReceiptCreate from "./pages/admin/StockReceiptCreate";
import StockIssues from "./pages/admin/StockIssues";
import Inventory from "./pages/admin/Inventory";
import Warehouses from "./pages/admin/Warehouses";
import Suppliers from "./pages/admin/Suppliers";
import StockReceiptDetail from "./pages/admin/StockReceiptDetail";
import StockIssueCreate from "./pages/admin/StockIssueCreate";
import StockIssueDetail from "./pages/admin/StockIssueDetail";
import InventoryReport from "./pages/admin/InventoryReport";
import DeviceSimSync from "./pages/admin/DeviceSimSync";
import Users from "./pages/admin/Users";
import Employees from "./pages/admin/Employees";

// Error Pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            {/* Add more public routes here */}
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/:id/edit" element={<ProductEdit />} />
            <Route path="categories" element={<Categories />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="origins" element={<Origins />} />
            <Route path="stock-receipts" element={<StockReceipts />} />
            <Route path="stock-receipts/create" element={<StockReceiptCreate />} />
            <Route path="stock-receipts/:id" element={<StockReceiptDetail />} />
            <Route path="stock-issues" element={<StockIssues />} />
            <Route path="stock-issues/create" element={<StockIssueCreate />} />
            <Route path="stock-issues/:id" element={<StockIssueDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports/inventory" element={<InventoryReport />} />
            <Route path="integrations/devices-sims" element={<DeviceSimSync />} />
            <Route path="users" element={<Users />} />
            <Route path="employees" element={<Employees />} />
            {/* Add more admin routes here */}
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

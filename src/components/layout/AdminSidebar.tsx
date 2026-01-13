import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  Users,
  Building2,
  Truck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Boxes,
  Tag,
  Globe,
  Ruler,
  Box,
  UserCog,
  Receipt,
  Plug,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { clearAuthToken } from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";

interface NavGroup {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    path: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Tong quan",
    items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/admin" }],
  },
  {
    title: "Quan ly hang hoa",
    items: [
      { icon: Package, label: "Hang hoa", path: "/admin/products" },
      { icon: Tag, label: "Loai hang hoa", path: "/admin/categories" },
      { icon: Globe, label: "Xuat xu", path: "/admin/origins" },
    ],
  },
  {
    title: "Quan ly kho",
    items: [
      { icon: Building2, label: "Kho hang", path: "/admin/warehouses" },
      { icon: PackagePlus, label: "Phieu nhap kho", path: "/admin/stock-receipts" },
      { icon: PackageMinus, label: "Phieu xuat kho", path: "/admin/stock-issues" },
      { icon: Boxes, label: "Ton kho", path: "/admin/inventory" },
    ],
  },
  {
    title: "Dong goi",
    items: [
      { icon: Ruler, label: "Don vi tinh", path: "/admin/uoms" },
      { icon: Box, label: "Quy cach", path: "/admin/packagings" },
    ],
  },
  {
    title: "Doi tac",
    items: [
      { icon: Users, label: "Khach hang", path: "/admin/customers" },
      { icon: Building2, label: "Nha cung cap", path: "/admin/suppliers" },
      { icon: Truck, label: "Van chuyen", path: "/admin/carriers" },
    ],
  },
  {
    title: "Tich hop",
    items: [{ icon: Plug, label: "Dong bo thiet bi & SIM", path: "/admin/integrations/devices-sims" }],
  },
  {
    title: "Tai khoan",
    items: [
      { icon: UserCog, label: "Nhan vien", path: "/admin/employees" },
      { icon: Users, label: "Nguoi dung", path: "/admin/users" },
    ],
  },
  {
    title: "Bao cao",
    items: [
      { icon: BarChart3, label: "BC Ton kho", path: "/admin/reports/inventory" },
      { icon: FileText, label: "BC Hang hoa", path: "/admin/reports/products" },
      { icon: Receipt, label: "BC Xuat nhap", path: "/admin/reports/transactions" },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navGroups.map((g) => g.title));

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  };

  const isActivePath = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm">HIỆN TRƯỜNG VOSAQN</h1>
            <p className="text-xs text-sidebar-foreground/60">Quan tri he thong</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.title);
          return (
            <div key={group.title}>
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70"
              >
                {group.title}
                <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded ? "rotate-0" : "-rotate-90")} />
              </button>
              {isExpanded && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    return (
                      <Link key={item.path} to={item.path} className={cn("nav-item", isActive && "active")}>
                        <Icon className="nav-item-icon" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link to="/admin/settings" className="nav-item">
          <Settings className="nav-item-icon" />
          <span>Cai dat</span>
        </Link>
        <button
          className="nav-item w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            clearAuthToken();
            navigate("/login");
          }}
        >
          <LogOut className="nav-item-icon" />
          <span>Dang xuat</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

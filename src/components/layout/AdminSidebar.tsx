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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
    title: "Tổng quan",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    ],
  },
  {
    title: "Quản lý hàng hóa",
    items: [
      { icon: Package, label: "Hàng hóa", path: "/admin/products" },
      { icon: Tag, label: "Loại hàng hóa", path: "/admin/categories" },
      { icon: Globe, label: "Xuất xứ", path: "/admin/origins" },
    ],
  },
  {
    title: "Quản lý kho",
    items: [
      { icon: PackagePlus, label: "Phiếu nhập kho", path: "/admin/stock-receipts" },
      { icon: PackageMinus, label: "Phiếu xuất kho", path: "/admin/stock-issues" },
      { icon: Boxes, label: "Tồn kho", path: "/admin/inventory" },
    ],
  },
  {
    title: "Đóng gói",
    items: [
      { icon: Ruler, label: "Đơn vị tính", path: "/admin/uoms" },
      { icon: Box, label: "Quy cách", path: "/admin/packagings" },
    ],
  },
  {
    title: "Đối tác",
    items: [
      { icon: Users, label: "Khách hàng", path: "/admin/customers" },
      { icon: Building2, label: "Nhà cung cấp", path: "/admin/suppliers" },
      { icon: Truck, label: "Vận chuyển", path: "/admin/carriers" },
    ],
  },
  {
    title: "Tài khoản",
    items: [
      { icon: UserCog, label: "Nhân viên", path: "/admin/employees" },
      { icon: Users, label: "Người dùng", path: "/admin/users" },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      { icon: BarChart3, label: "BC Tồn kho", path: "/admin/reports/inventory" },
      { icon: FileText, label: "BC Hàng hóa", path: "/admin/reports/products" },
      { icon: Receipt, label: "BC Xuất nhập", path: "/admin/reports/transactions" },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navGroups.map((g) => g.title)
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm">VOSA QUẢNG NINH</h1>
            <p className="text-xs text-sidebar-foreground/60">Quản trị hệ thống</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
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
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>
              {isExpanded && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn("nav-item", isActive && "active")}
                      >
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

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link to="/admin/settings" className="nav-item">
          <Settings className="nav-item-icon" />
          <span>Cài đặt</span>
        </Link>
        <button className="nav-item w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="nav-item-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

import { Link, useLocation } from "react-router-dom";
import { 
  Search, 
  Package, 
  HelpCircle, 
  BarChart3,
  Boxes,
  Cpu,
  Wrench,
  Truck,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  { icon: Boxes, label: "Tất cả thiết bị", path: "/products" },
  { icon: Cpu, label: "Thiết bị điện tử", path: "/products?category=electronics" },
  { icon: Wrench, label: "Dụng cụ cơ khí", path: "/products?category=mechanical" },
  { icon: Truck, label: "Phụ tùng xe", path: "/products?category=vehicle" },
  { icon: Package, label: "Vật tư tiêu hao", path: "/products?category=consumables" },
];

const PublicSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* Search Box */}
        <div className="bg-card rounded-xl p-4 card-elevated">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Tra cứu thiết bị
          </h3>
          <div className="space-y-2">
            <Input 
              placeholder="Nhập tên hoặc mã thiết bị..." 
              className="text-sm"
            />
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-card rounded-xl p-4 card-elevated">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            Kho Hàng
          </h3>
          <nav className="space-y-1">
            {categories.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname + location.search === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-xl p-4 card-elevated">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Trợ giúp Online
          </h3>
          <div className="space-y-2 text-sm">
            <Link to="/help" className="block text-muted-foreground hover:text-primary transition-colors">
              → Hướng dẫn sử dụng
            </Link>
            <Link to="/faq" className="block text-muted-foreground hover:text-primary transition-colors">
              → Câu hỏi thường gặp
            </Link>
            <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
              → Liên hệ hỗ trợ
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-xl p-4 card-elevated">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Thống kê Online
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng thiết bị:</span>
              <span className="font-semibold text-primary">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đang cho mượn:</span>
              <span className="font-semibold text-warning">56</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cần bảo trì:</span>
              <span className="font-semibold text-destructive">12</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PublicSidebar;

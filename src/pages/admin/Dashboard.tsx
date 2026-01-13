import {
  Package,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import StatsCard from "@/components/common/StatsCard";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock data
const recentReceipts = [
  { id: "PN-20240115-0001", supplier: "Công ty TNHH ABC", items: 5, total: "12,500,000 ₫", status: "confirmed" },
  { id: "PN-20240114-0003", supplier: "NCC Thiết bị XYZ", items: 3, total: "8,200,000 ₫", status: "draft" },
  { id: "PN-20240114-0002", supplier: "Công ty CP DEF", items: 8, total: "25,100,000 ₫", status: "confirmed" },
];

const lowStockItems = [
  { code: "VT-2024-0012", name: "Bóng đèn LED 40W", stock: 5, minStock: 20, unit: "cái" },
  { code: "VT-2024-0045", name: "Dây điện 2.5mm", stock: 12, minStock: 50, unit: "cuộn" },
  { code: "EQ-2024-0023", name: "Máy khoan cầm tay", stock: 2, minStock: 5, unit: "chiếc" },
];

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Tổng quan hệ thống quản lý kho VOSA Quảng Ninh"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Tổng hàng hóa"
          value="1,234"
          subtitle="mặt hàng trong kho"
          icon={Package}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Nhập hôm nay"
          value="15"
          subtitle="phiếu nhập mới"
          icon={PackagePlus}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Xuất hôm nay"
          value="23"
          subtitle="phiếu xuất hoàn thành"
          icon={PackageMinus}
          variant="warning"
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Cảnh báo tồn"
          value="8"
          subtitle="mặt hàng dưới mức tối thiểu"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Receipts */}
        <div className="bg-card rounded-xl border card-elevated">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Phiếu nhập gần đây</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/stock-receipts">
                Xem tất cả
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {recentReceipts.map((receipt) => (
              <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium font-mono text-sm">{receipt.id}</p>
                  <p className="text-sm text-muted-foreground">{receipt.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{receipt.total}</p>
                  <Badge
                    variant={receipt.status === "confirmed" ? "default" : "secondary"}
                    className={receipt.status === "confirmed" ? "bg-success text-success-foreground" : ""}
                  >
                    {receipt.status === "confirmed" ? "Đã xác nhận" : "Nháp"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card rounded-xl border card-elevated">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="font-semibold">Cảnh báo tồn kho thấp</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/inventory">
                Xem tất cả
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {lowStockItems.map((item) => (
              <div key={item.code} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-destructive">
                    {item.stock} <span className="text-muted-foreground font-normal">/ {item.minStock} {item.unit}</span>
                  </p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-destructive rounded-full"
                      style={{ width: `${(item.stock / item.minStock) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-card rounded-xl border card-elevated p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Thao tác nhanh
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/stock-receipts/create">
              <PackagePlus className="w-4 h-4 mr-2" />
              Tạo phiếu nhập
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/stock-issues/create">
              <PackageMinus className="w-4 h-4 mr-2" />
              Tạo phiếu xuất
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/products/create">
              <Package className="w-4 h-4 mr-2" />
              Thêm hàng hóa
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/admin/reports/inventory">
              Xem báo cáo tồn kho
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

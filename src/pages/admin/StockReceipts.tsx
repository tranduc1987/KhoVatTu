import { useState } from "react";
import { Plus, Search, Filter, Download, FileText, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import { Link } from "react-router-dom";

interface StockReceipt {
  id: string;
  code: string;
  date: string;
  supplier: string;
  itemCount: number;
  total: string;
  createdBy: string;
  status: "draft" | "confirmed" | "cancelled";
}

// Mock data
const mockReceipts: StockReceipt[] = [
  { id: "1", code: "PN-20240115-0001", date: "15/01/2024", supplier: "Công ty TNHH ABC", itemCount: 5, total: "12,500,000 ₫", createdBy: "Nguyễn Văn A", status: "confirmed" },
  { id: "2", code: "PN-20240114-0003", date: "14/01/2024", supplier: "NCC Thiết bị XYZ", itemCount: 3, total: "8,200,000 ₫", createdBy: "Trần Thị B", status: "draft" },
  { id: "3", code: "PN-20240114-0002", date: "14/01/2024", supplier: "Công ty CP DEF", itemCount: 8, total: "25,100,000 ₫", createdBy: "Nguyễn Văn A", status: "confirmed" },
  { id: "4", code: "PN-20240113-0001", date: "13/01/2024", supplier: "Công ty TNHH GHI", itemCount: 2, total: "5,800,000 ₫", createdBy: "Lê Văn C", status: "cancelled" },
  { id: "5", code: "PN-20240112-0002", date: "12/01/2024", supplier: "NCC Vật tư JKL", itemCount: 10, total: "18,900,000 ₫", createdBy: "Nguyễn Văn A", status: "confirmed" },
];

const statusConfig = {
  draft: { label: "Nháp", className: "bg-muted text-muted-foreground" },
  confirmed: { label: "Đã xác nhận", className: "bg-success text-success-foreground" },
  cancelled: { label: "Đã hủy", className: "bg-destructive/10 text-destructive" },
};

const StockReceipts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const columns: Column<StockReceipt>[] = [
    {
      key: "code",
      header: "Mã phiếu",
      render: (item) => (
        <span className="font-mono text-sm font-medium text-primary">{item.code}</span>
      ),
    },
    {
      key: "date",
      header: "Ngày tạo",
    },
    {
      key: "supplier",
      header: "Nhà cung cấp",
      render: (item) => (
        <span className="font-medium">{item.supplier}</span>
      ),
    },
    {
      key: "itemCount",
      header: "Số dòng",
      render: (item) => (
        <span>{item.itemCount} mặt hàng</span>
      ),
    },
    {
      key: "total",
      header: "Tổng tiền",
      render: (item) => (
        <span className="font-semibold">{item.total}</span>
      ),
    },
    {
      key: "createdBy",
      header: "Người lập",
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => {
        const config = statusConfig[item.status];
        return (
          <Badge className={config.className}>{config.label}</Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Xem chi tiết" asChild>
            <Link to={`/admin/stock-receipts/${item.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" title="In phiếu">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Xuất PDF">
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const filteredReceipts = mockReceipts.filter((r) => {
    const matchSearch = r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Phiếu nhập kho"
        description="Quản lý các phiếu nhập hàng hóa vào kho"
        breadcrumbs={[
          { label: "Trang chủ", href: "/admin" },
          { label: "Phiếu nhập kho" },
        ]}
        actions={
          <>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button asChild>
              <Link to="/admin/stock-receipts/create">
                <Plus className="w-4 h-4 mr-2" />
                Tạo phiếu nhập
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-primary">156</p>
          <p className="text-sm text-muted-foreground">Tổng phiếu tháng này</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-success">142</p>
          <p className="text-sm text-muted-foreground">Đã xác nhận</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-warning">14</p>
          <p className="text-sm text-muted-foreground">Đang chờ xử lý</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã phiếu hoặc nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReceipts}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy phiếu nhập nào"
        pagination={{
          currentPage: 1,
          totalPages: 10,
          onPageChange: (page) => console.log("Page:", page),
        }}
      />
    </div>
  );
};

export default StockReceipts;

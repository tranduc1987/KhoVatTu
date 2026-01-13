import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Eye, Printer, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import { Link } from "react-router-dom";
import { apiDownload, apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface StockReceipt {
  id: string;
  code: string;
  status: "draft" | "submitted" | "approved" | "cancelled";
  supplier?: string | null;
  warehouse?: string | null;
  createdBy?: string | null;
  createdAt?: string;
}

interface ReceiptApi {
  id: number;
  code: string;
  status: string;
  supplier_name?: string | null;
  warehouse_name?: string | null;
  created_by_name?: string | null;
  created_at?: string;
}

const statusConfig: Record<
  StockReceipt["status"],
  { label: string; className: string }
> = {
  draft: { label: "Nhap", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Da gui duyet", className: "bg-warning/20 text-warning-foreground" },
  approved: { label: "Da duyet", className: "bg-success text-success-foreground" },
  cancelled: { label: "Da huy", className: "bg-destructive/10 text-destructive" },
};

const StockReceipts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [receipts, setReceipts] = useState<StockReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const columns: Column<StockReceipt>[] = [
    {
      key: "code",
      header: "Ma phieu",
      render: (item) => <span className="font-mono text-sm font-medium text-primary">{item.code}</span>,
    },
    {
      key: "createdAt",
      header: "Ngay tao",
      render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "--"),
    },
    {
      key: "supplier",
      header: "Nha cung cap",
      render: (item) => <span className="font-medium">{item.supplier || "—"}</span>,
    },
    {
      key: "warehouse",
      header: "Kho",
      render: (item) => <span>{item.warehouse || "—"}</span>,
    },
    {
      key: "createdBy",
      header: "Nguoi lap",
      render: (item) => <span>{item.createdBy || "—"}</span>,
    },
    {
      key: "status",
      header: "Trang thai",
      render: (item) => {
        const config = statusConfig[item.status];
        return <Badge className={config.className}>{config.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Xem chi tiet" asChild>
            <Link to={`/admin/stock-receipts/${item.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="In phieu (PDF)"
            onClick={() => handleExport(item.id, "pdf")}
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Xuat Excel"
            onClick={() => handleExport(item.id, "excel")}
          >
            <FileText className="w-4 h-4" />
          </Button>
          {item.status !== "approved" && (
            <Button
              variant="ghost"
              size="icon"
              title="Xoa phieu"
              disabled={isDeleting === item.id}
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<ReceiptApi[]>("/warehouse/receipts");
        if (!mounted) return;
        const mapped = data.map<StockReceipt>((item) => ({
          id: String(item.id),
          code: item.code,
          status: (item.status as StockReceipt["status"]) || "draft",
          supplier: item.supplier_name,
          warehouse: item.warehouse_name,
          createdBy: item.created_by_name,
          createdAt: item.created_at,
        }));
        setReceipts(mapped);
      } catch (error) {
        toast({
          title: "Khong the tai danh sach phieu nhap",
          description: error instanceof Error ? error.message : "Vui long thu lai.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleExport = async (id: string, type: "pdf" | "excel") => {
    try {
      if (type === "pdf") {
        await apiDownload(`/warehouse/exports/receipts/${id}/pdf`, `receipt-${id}.pdf`);
      } else {
        await apiDownload(`/warehouse/exports/receipts/${id}/excel`, `receipt-${id}.xlsx`);
      }
    } catch (error) {
      toast({
        title: "Xuat file that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const target = receipts.find((r) => r.id === id);
    if (!target) return;
    const confirmed = window.confirm(`Xoa phieu ${target.code}?`);
    if (!confirmed) return;
    setIsDeleting(id);
    try {
      await apiFetch(`/warehouse/receipts/${id}`, { method: "DELETE" });
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Da xoa phieu nhap" });
    } catch (error) {
      toast({
        title: "Khong the xoa phieu",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchSearch =
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.supplier || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Phieu nhap kho"
        description="Quan ly cac phieu nhap hang hoa vao kho"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Phieu nhap kho" },
        ]}
        actions={
          <Button asChild>
            <Link to="/admin/stock-receipts/create">
              <Plus className="w-4 h-4 mr-2" />
              Tao phieu nhap
            </Link>
          </Button>
        }
      />

      <div className="bg-card rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tim theo ma phieu hoac nha cung cap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca trang thai</SelectItem>
            <SelectItem value="draft">Nhap</SelectItem>
            <SelectItem value="submitted">Da gui duyet</SelectItem>
            <SelectItem value="approved">Da duyet</SelectItem>
            <SelectItem value="cancelled">Da huy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredReceipts}
        keyExtractor={(item) => item.id}
        emptyMessage="Khong tim thay phieu nhap nao"
        isLoading={isLoading}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};

export default StockReceipts;

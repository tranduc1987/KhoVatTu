import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface Issue {
  id: string;
  code: string;
  status: "draft" | "submitted" | "approved" | "cancelled";
  warehouse?: string | null;
  createdBy?: string | null;
  issuedAt?: string | null;
  totalQuantity?: number | null;
}

interface IssueApi {
  id: number;
  code: string;
  status: string;
  warehouse_name?: string | null;
  created_by_name?: string | null;
  issued_at?: string | null;
  total_quantity?: number | null;
}

const statusConfig: Record<
  Issue["status"],
  { label: string; className: string }
> = {
  draft: { label: "Nhap", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Da gui duyet", className: "bg-warning/20 text-warning-foreground" },
  approved: { label: "Da duyet", className: "bg-success text-success-foreground" },
  cancelled: { label: "Da huy", className: "bg-destructive/10 text-destructive" },
};

const StockIssues = () => {
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const columns: Column<Issue>[] = [
    {
      key: "code",
      header: "Ma phieu",
      render: (item) => <span className="font-mono text-sm font-medium text-primary">{item.code}</span>,
    },
    { key: "warehouse", header: "Kho" },
    {
      key: "totalQuantity",
      header: "So luong",
      render: (item) => (item.totalQuantity ?? 0).toLocaleString(),
    },
    {
      key: "issuedAt",
      header: "Ngay xuat",
      render: (item) => (item.issuedAt ? new Date(item.issuedAt).toLocaleDateString() : "--"),
    },
    { key: "createdBy", header: "Nguoi lap" },
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/stock-issues/${item.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
          {item.status !== "approved" && (
            <Button
              variant="ghost"
              size="sm"
              title="Xoa phieu"
              disabled={isDeleting === item.id}
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<IssueApi[]>("/warehouse/issues");
        if (mounted) {
          setIssues(
            data.map((i) => ({
              id: String(i.id),
              code: i.code,
              status: (i.status as Issue["status"]) || "draft",
              warehouse: i.warehouse_name,
              createdBy: i.created_by_name,
              issuedAt: i.issued_at,
              totalQuantity: i.total_quantity,
            }))
          );
        }
      } catch (error) {
        toast({
          title: "Khong the tai phieu xuat",
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

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      const matchSearch =
        i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.warehouse || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [issues, searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    const target = issues.find((i) => i.id === id);
    if (!target) return;
    const confirmDelete = window.confirm(`Xoa phieu ${target.code}?`);
    if (!confirmDelete) return;
    setIsDeleting(id);
    try {
      await apiFetch(`/warehouse/issues/${id}`, { method: "DELETE" });
      setIssues((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Da xoa phieu xuat" });
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Phieu xuat kho"
        description="Quan ly cac phieu xuat hang"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Phieu xuat kho" },
        ]}
        actions={
          <Button asChild>
            <Link to="/admin/stock-issues/create">
              <Plus className="w-4 h-4 mr-2" />
              Tao phieu xuat
            </Link>
          </Button>
        }
      />

      <div className="bg-card rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tim theo ma phieu hoac kho..."
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
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="draft">Nhap</SelectItem>
            <SelectItem value="submitted">Da gui duyet</SelectItem>
            <SelectItem value="approved">Da duyet</SelectItem>
            <SelectItem value="cancelled">Da huy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        emptyMessage="Khong co phieu xuat"
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

export default StockIssues;

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface IssueItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

interface Issue {
  id: number;
  code: string;
  status: string;
  warehouse_name: string;
  created_by_name?: string | null;
  issued_at?: string | null;
  items: IssueItem[];
  created_at?: string;
}

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-warning/20 text-warning-foreground",
  approved: "bg-success text-success-foreground",
};

const StockIssueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const columns: Column<IssueItem>[] = [
    { key: "sku", header: "SKU" },
    { key: "product_name", header: "Ten hang" },
    {
      key: "quantity",
      header: "So luong",
      render: (item) => <span className="font-semibold">{item.quantity}</span>,
    },
    { key: "unit_price", header: "Don gia" },
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<Issue>(`/warehouse/issues/${id}`);
        if (mounted) setIssue(data);
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
  }, [id, toast]);

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Dang tai du lieu...</div>;
  }

  if (!issue) {
    return (
      <div className="p-6">
        <p className="text-destructive font-medium">Khong tim thay phieu.</p>
        <Button className="mt-3" asChild>
          <Link to="/admin/stock-issues">Quay lai danh sach</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Phieu xuat ${issue.code}`}
        description="Chi tiet phieu xuat"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Phieu xuat", href: "/admin/stock-issues" },
          { label: issue.code },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thong tin</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Ma phieu</p>
            <p className="font-mono font-semibold">{issue.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Trang thai</p>
            <Badge className={statusColor[issue.status] || "bg-muted text-muted-foreground"}>{issue.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kho</p>
            <p>{issue.warehouse_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nguoi lap</p>
            <p>{issue.created_by_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Thoi gian xuat</p>
            <p>{issue.issued_at ? new Date(issue.issued_at).toLocaleString() : "Chua co"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Thoi gian tao</p>
            <p>{issue.created_at ? new Date(issue.created_at).toLocaleString() : "Chua co"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hang hoa</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={issue.items || []}
            keyExtractor={(item) => String(item.id)}
            emptyMessage="Chua co hang hoa"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StockIssueDetail;

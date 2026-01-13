import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface ReceiptItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_cost: number;
}

interface Receipt {
  id: number;
  code: string;
  status: string;
  supplier_name?: string | null;
  warehouse_name: string;
  created_by_name?: string | null;
  received_at?: string | null;
  items: ReceiptItem[];
}

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-warning/20 text-warning-foreground",
  approved: "bg-success text-success-foreground",
};

const StockReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const columns: Column<ReceiptItem>[] = [
    { key: "sku", header: "SKU" },
    { key: "product_name", header: "Ten hang" },
    { key: "quantity", header: "So luong" },
    { key: "unit_cost", header: "Don gia" },
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<Receipt>(`/warehouse/receipts/${id}`);
        if (mounted) setReceipt(data);
      } catch (error) {
        toast({
          title: "Khong the tai phieu nhap",
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

  if (!receipt) {
    return (
      <div className="p-6">
        <p className="text-destructive font-medium">Khong tim thay phieu.</p>
        <Button className="mt-3" asChild>
          <Link to="/admin/stock-receipts">Quay lai danh sach</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Phieu nhap ${receipt.code}`}
        description="Chi tiet phieu nhap"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Phieu nhap", href: "/admin/stock-receipts" },
          { label: receipt.code },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thong tin</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Ma phieu</p>
            <p className="font-mono font-semibold">{receipt.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Trang thai</p>
            <Badge className={statusColor[receipt.status] || "bg-muted text-muted-foreground"}>
              {receipt.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nha cung cap</p>
            <p>{receipt.supplier_name || "Khong co"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kho</p>
            <p>{receipt.warehouse_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nguoi lap</p>
            <p>{receipt.created_by_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Thoi gian nhan</p>
            <p>{receipt.received_at ? new Date(receipt.received_at).toLocaleString() : "Chua co"}</p>
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
            data={receipt.items || []}
            keyExtractor={(item) => String(item.id)}
            emptyMessage="Chua co hang hoa"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReceiptDetail;

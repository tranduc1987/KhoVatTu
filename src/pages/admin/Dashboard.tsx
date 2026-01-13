import { useEffect, useMemo, useState } from "react";
import { Package, PackagePlus, PackageMinus, AlertTriangle, TrendingUp, ArrowUpRight, Check, Clock } from "lucide-react";
import StatsCard from "@/components/common/StatsCard";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductApi {
  id: number;
  sku: string;
  name: string;
  min_stock: number;
}

interface InventoryApi {
  sku: string;
  quantity: number;
}

interface ReceiptApi {
  id: number;
  code: string;
  status: string;
  supplier_name?: string | null;
}

interface IssueApi {
  id: number;
  code: string;
  status: string;
  warehouse_name?: string | null;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [inventory, setInventory] = useState<InventoryApi[]>([]);
  const [receipts, setReceipts] = useState<ReceiptApi[]>([]);
  const [issues, setIssues] = useState<IssueApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptFilter, setReceiptFilter] = useState<"all" | "pending">("all");
  const [issueFilter, setIssueFilter] = useState<"all" | "pending">("all");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [productRes, inventoryRes, receiptRes, issueRes] = await Promise.all([
          apiFetch<ProductApi[]>("/catalog/products"),
          apiFetch<InventoryApi[]>("/catalog/inventory"),
          apiFetch<ReceiptApi[]>("/warehouse/receipts"),
          apiFetch<IssueApi[]>("/warehouse/issues"),
        ]);
        if (!mounted) return;
        setProducts(productRes);
        setInventory(inventoryRes);
        setReceipts(receiptRes);
        setIssues(issueRes);
      } catch (error) {
        toast({
          title: "Khong the tai du lieu tong quan",
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

  const inventoryBySku = useMemo(() => {
    return inventory.reduce<Record<string, number>>((acc, item) => {
      acc[item.sku] = (acc[item.sku] || 0) + item.quantity;
      return acc;
    }, {});
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return products
      .map((p) => ({
        code: p.sku,
        name: p.name,
        stock: inventoryBySku[p.sku] || 0,
        minStock: p.min_stock,
      }))
      .filter((item) => item.stock < item.minStock)
      .slice(0, 5);
  }, [products, inventoryBySku]);

  const recentReceipts = useMemo(
    () => {
      const filtered = receipts.filter((r) => (receiptFilter === "pending" ? r.status === "submitted" : true));
      return filtered
        .slice(-5)
        .reverse()
        .map((r) => ({
          id: r.id,
          code: `PN-${r.code}`,
          supplier: r.supplier_name || "N/A",
          status: r.status,
        }));
    },
    [receipts, receiptFilter]
  );

  const filteredIssues = useMemo(
    () =>
      issues
        .filter((i) => (issueFilter === "pending" ? i.status === "submitted" : true))
        .slice(-5)
        .reverse(),
    [issues, issueFilter]
  );

  const approvedReceiptsToday = receipts.filter((r) => r.status === "approved").length;
  const pendingReceipts = receipts.filter((r) => r.status === "submitted").length;
  const pendingIssues = issues.filter((i) => i.status === "submitted").length;

  const handleApprove = async (type: "receipt" | "issue", id: number | string) => {
    setApprovingId(`${type}-${id}`);
    try {
      const endpoint = type === "receipt" ? `/warehouse/receipts/${id}/approve` : `/warehouse/issues/${id}/approve`;
      await apiFetch(endpoint, { method: "POST" });
      if (type === "receipt") {
        setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
      } else {
        setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "approved" } : i)));
      }
      toast({ title: "Duyet thanh cong" });
    } catch (error) {
      toast({
        title: "Khong the duyet",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="Tong quan he thong quan ly kho" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Tong hang hoa"
          value={products.length.toLocaleString()}
          subtitle="Mat hang trong he thong"
          icon={Package}
          variant="primary"
          trend={{ value: products.length > 0 ? 12 : 0, isPositive: true }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Nhap da duyet"
          value={approvedReceiptsToday.toLocaleString()}
          subtitle="Phieu nhap da duyet"
          icon={PackagePlus}
          variant="success"
          trend={{ value: approvedReceiptsToday, isPositive: true }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Nhap cho duyet"
          value={pendingReceipts.toLocaleString()}
          subtitle="Phieu dang cho"
          icon={PackageMinus}
          variant="warning"
          trend={{ value: pendingReceipts, isPositive: pendingReceipts === 0 }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Xuat cho duyet"
          value={pendingIssues.toLocaleString()}
          subtitle="Phieu xuat dang cho"
          icon={Clock}
          variant="warning"
          trend={{ value: pendingIssues, isPositive: pendingIssues === 0 }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Canh bao ton"
          value={lowStockItems.length.toLocaleString()}
          subtitle="Mat hang duoi ton toi thieu"
          icon={AlertTriangle}
          variant="danger"
          isLoading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border card-elevated">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Phieu nhap gan day</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select value={receiptFilter} onValueChange={(v: "all" | "pending") => setReceiptFilter(v)}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue placeholder="Bo loc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  <SelectItem value="pending">Cho duyet</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/stock-receipts">
                  Xem tat ca
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="divide-y">
            {recentReceipts.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">Chua co phieu nhap.</div>
            ) : (
              recentReceipts.map((receipt) => (
                <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium font-mono text-sm">{receipt.code}</p>
                    <p className="text-sm text-muted-foreground">{receipt.supplier}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={receipt.status === "approved" ? "default" : "secondary"}
                      className={
                        receipt.status === "approved"
                          ? "bg-success text-success-foreground"
                          : receipt.status === "submitted"
                            ? "bg-warning/20 text-warning-foreground"
                            : ""
                      }
                    >
                      {receipt.status}
                    </Badge>
                    {receipt.status === "submitted" && (
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={approvingId === `receipt-${receipt.id}`}
                        onClick={() => handleApprove("receipt", receipt.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Duyet
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border card-elevated">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageMinus className="w-5 h-5 text-warning" />
              <h2 className="font-semibold">Phieu xuat gan day</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select value={issueFilter} onValueChange={(v: "all" | "pending") => setIssueFilter(v)}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue placeholder="Bo loc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  <SelectItem value="pending">Cho duyet</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/stock-issues">
                  Xem tat ca
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="divide-y">
            {filteredIssues.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">Chua co phieu xuat.</div>
            ) : (
              filteredIssues.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">PX-{item.code}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.warehouse_name || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={item.status === "approved" ? "default" : "secondary"}
                      className={
                        item.status === "approved"
                          ? "bg-success text-success-foreground"
                          : item.status === "submitted"
                            ? "bg-warning/20 text-warning-foreground"
                            : ""
                      }
                    >
                      {item.status}
                    </Badge>
                    {item.status === "submitted" && (
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={approvingId === `issue-${item.id}`}
                        onClick={() => handleApprove("issue", item.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Duyet
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border card-elevated">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="font-semibold">Canh bao ton kho thap</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/inventory">
                Xem tat ca
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {lowStockItems.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">Khong co canh bao ton kho.</div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.code} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {item.stock} <span className="text-muted-foreground font-normal">/ {item.minStock}</span>
                    </p>
                    <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-destructive rounded-full"
                        style={{ width: `${Math.min((item.stock / item.minStock) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-xl border card-elevated p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Thao tac nhanh
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/stock-receipts/create">
              <PackagePlus className="w-4 h-4 mr-2" />
              Tao phieu nhap
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/stock-issues/create">
              <PackageMinus className="w-4 h-4 mr-2" />
              Tao phieu xuat
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/products/create">
              <Package className="w-4 h-4 mr-2" />
              Them hang hoa
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/admin/reports/inventory">
              Xem bao cao ton kho
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

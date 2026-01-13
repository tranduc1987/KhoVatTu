import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/apiClient";

interface Warehouse {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
}

interface IssueItem {
  productId: string;
  quantity: string;
  unitPrice: string;
}

const StockIssueCreate = () => {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    warehouseId: "none",
    items: [] as IssueItem[],
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [wh, prods] = await Promise.all([
          apiFetch<Warehouse[]>("/catalog/warehouses"),
          apiFetch<Product[]>("/catalog/products"),
        ]);
        if (mounted) {
          setWarehouses(wh);
          setProducts(prods);
          setForm((prev) => ({
            ...prev,
            warehouseId: prev.warehouseId === "none" && wh.length > 0 ? String(wh[0].id) : prev.warehouseId,
            items: prev.items.length ? prev.items : [{ productId: "", quantity: "", unitPrice: "" }],
          }));
        }
      } catch (error) {
        toast({
          title: "Khong the tai du lieu",
          description: error instanceof Error ? error.message : "Vui long thu lai.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const updateItem = (idx: number, patch: Partial<IssueItem>) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, items: next };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { productId: "", quantity: "", unitPrice: "" }] }));
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || form.warehouseId === "none") {
      toast({ title: "Vui long nhap ma phieu va chon kho", variant: "destructive" });
      return;
    }
    const itemsPayload = form.items
      .filter((item) => item.productId && item.quantity)
      .map((item) => ({
        product_id: Number(item.productId),
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unitPrice) || 0,
      }))
      .filter((item) => item.quantity > 0);
    if (itemsPayload.length === 0) {
      toast({ title: "Can them it nhat 1 dong hang", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/warehouse/issues", {
        method: "POST",
        body: JSON.stringify({
          code: form.code.trim(),
          warehouse_id: Number(form.warehouseId),
          items: itemsPayload,
        }),
      });
      toast({ title: "Da tao phieu xuat" });
      setForm({
        code: "",
        warehouseId: warehouses.length > 0 ? String(warehouses[0].id) : "none",
        items: [{ productId: "", quantity: "", unitPrice: "" }],
      });
    } catch (error) {
      toast({
        title: "Tao phieu that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tao phieu xuat kho"
        description="Xuat hang ra kho"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Phieu xuat kho", href: "/admin/stock-issues" },
          { label: "Tao moi" },
        ]}
      />

      <div className="bg-card border rounded-xl p-6 max-w-5xl">
        {loading ? (
          <div className="text-muted-foreground">Dang tai du lieu...</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="code">Ma phieu</Label>
                <Input
                  id="code"
                  required
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="PX-2025-0001"
                />
              </div>
              <div className="space-y-2">
                <Label>Kho xuat</Label>
                <Select
                  value={form.warehouseId}
                  onValueChange={(val) => setForm((p) => ({ ...p, warehouseId: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon kho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Khong chon</SelectItem>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Dong hang</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Them dong
                </Button>
              </div>
              <div className="space-y-3">
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-12 items-end border rounded-lg p-3">
                    <div className="sm:col-span-5 space-y-1">
                      <Label>San pham</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(val) => updateItem(idx, { productId: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chon san pham" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.sku} - {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label>So luong</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label>Don gia</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, { unitPrice: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(idx)}
                        disabled={form.items.length === 1}
                        title="Xoa dong"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Plus className="w-4 h-4 mr-2" />
                {submitting ? "Dang luu..." : "Tao phieu xuat"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StockIssueCreate;

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: number;
  name: string;
}

interface ProductApi {
  id: number;
  sku: string;
  name: string;
  category_id?: number | null;
  unit: string;
  origin?: string | null;
  cost: number;
  price: number;
  min_stock: number;
}

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    categoryId: "none",
    unit: "",
    origin: "",
    cost: "",
    price: "",
    minStock: "",
  });

  const productId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const data = await apiFetch<Category[]>("/catalog/categories");
        if (mounted) setCategories(data);
      } catch (error) {
        toast({
          title: "Khong the tai danh muc",
          description: error instanceof Error ? error.message : "Vui long thu lai.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!productId || Number.isNaN(productId)) {
      setNotFound(true);
      setLoadingProduct(false);
      return;
    }
    let mounted = true;
    const loadProduct = async () => {
      try {
        const products = await apiFetch<ProductApi[]>("/catalog/products");
        const target = products.find((p) => p.id === productId);
        if (!target) {
          setNotFound(true);
          return;
        }
        if (mounted) {
          setForm({
            sku: target.sku,
            name: target.name,
            categoryId: target.category_id ? String(target.category_id) : "none",
            unit: target.unit,
            origin: target.origin || "",
            cost: target.cost?.toString() ?? "",
            price: target.price?.toString() ?? "",
            minStock: target.min_stock?.toString() ?? "",
          });
        }
      } catch (error) {
        toast({
          title: "Khong the tai hang hoa",
          description: error instanceof Error ? error.message : "Vui long thu lai.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoadingProduct(false);
      }
    };
    loadProduct();
    return () => {
      mounted = false;
    };
  }, [productId, toast]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku.trim() || !form.name.trim() || !form.unit.trim() || !form.origin.trim()) {
      toast({
        title: "Vui long dien day du ma, ten, don vi va xuat xu",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const cost = parseFloat(form.cost || "0");
      const price = parseFloat(form.price || "0");
      const minStock = parseFloat(form.minStock || "0");

      await apiFetch(`/catalog/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify({
          sku: form.sku.trim(),
          name: form.name.trim(),
          category_id: form.categoryId === "none" ? null : Number(form.categoryId),
          unit: form.unit.trim(),
          origin: form.origin.trim(),
          cost: Number.isFinite(cost) ? cost : 0,
          price: Number.isFinite(price) ? price : 0,
          min_stock: Number.isFinite(minStock) ? minStock : 0,
        }),
      });
      toast({ title: "Da cap nhat hang hoa" });
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Cap nhat that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="p-6">
        <p className="text-destructive font-medium">Khong tim thay hang hoa.</p>
        <Button className="mt-3" asChild>
          <Link to="/admin/products">Quay lai danh sach</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Chinh sua hang hoa"
        description="Cap nhat thong tin san pham/vat tu"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Hang hoa", href: "/admin/products" },
          { label: "Chinh sua" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lai danh sach
            </Link>
          </Button>
        }
      />

      <div className="bg-card border rounded-xl p-6 max-w-3xl">
        {loadingProduct ? (
          <div className="text-muted-foreground">Dang tai du lieu...</div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="sku">Ma hang</Label>
              <Input
                id="sku"
                required
                value={form.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="VD: VT-2025-0001"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Ten hang hoa</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nhap ten hang hoa"
              />
            </div>

            <div className="space-y-2">
              <Label>Danh muc</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => updateField("categoryId", val)}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Dang tai..." : "Chon danh muc"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Khong phan loai</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Don vi tinh</Label>
              <Input
                id="unit"
                required
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="cai, bo, cuon..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Xuat xu</Label>
              <Input
                id="origin"
                required
                value={form.origin}
                onChange={(e) => updateField("origin", e.target.value)}
                placeholder="VN, EU, US..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Gia nhap</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => updateField("cost", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Gia xuat</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Ton toi thieu</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                step="1"
                value={form.minStock}
                onChange={(e) => updateField("minStock", e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Huy
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? "Dang luu..." : "Luu thay doi"}
              </Button>
            </div>
          </form>
        )}
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
          <Badge variant="secondary">Luu y</Badge>
          Cac truong ma, ten, don vi va xuat xu la bat buoc; gia tri rong se khong duoc chap nhan.
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, ArrowLeft, Upload } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/apiClient";

interface Category {
  id: number;
  name: string;
}

const ProductCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const [form, setForm] = useState({
    sku: "",
    name: "",
    categoryId: "none",
    unit: "",
    origin: "",
    cost: "",
    price: "",
    minStock: "",
    imageUrl: "",
  });

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const data = await apiFetch<Category[]>("/catalog/categories");
        if (mounted) setCategories(data);
      } catch (error) {
        toast({
          title: "Không tải được danh mục",
          description: error instanceof Error ? error.message : "Vui lòng thử lại.",
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

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await apiFetch<{ url: string }>("/catalog/products/upload", {
        method: "POST",
        body: JSON.stringify({ image_base64: base64 }),
      });
      updateField("imageUrl", res.url);
      setPreview(res.url);
      toast({ title: "Tải ảnh thành công" });
    } catch (error) {
      toast({
        title: "Tải ảnh thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku.trim() || !form.name.trim() || !form.unit.trim() || !form.origin.trim()) {
      toast({
        title: "Vui lòng điền đủ mã, tên, đơn vị và xuất xứ",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const cost = parseFloat(form.cost || "0");
      const price = parseFloat(form.price || "0");
      const minStock = parseFloat(form.minStock || "0");

      await apiFetch("/catalog/products", {
        method: "POST",
        body: JSON.stringify({
          sku: form.sku.trim(),
          name: form.name.trim(),
          category_id: form.categoryId === "none" ? null : Number(form.categoryId),
          unit: form.unit.trim(),
          origin: form.origin.trim(),
          image_url: form.imageUrl || undefined,
          cost: Number.isFinite(cost) ? cost : 0,
          price: Number.isFinite(price) ? price : 0,
          min_stock: Number.isFinite(minStock) ? minStock : 0,
        }),
      });
      toast({ title: "Đã tạo hàng hóa" });
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Tạo hàng hóa thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Thêm hàng hóa"
        description="Tạo mới sản phẩm/vật tư"
        breadcrumbs={[
          { label: "Trang chủ", href: "/admin" },
          { label: "Hàng hóa", href: "/admin/products" },
          { label: "Thêm mới" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Link>
          </Button>
        }
      />

      <div className="bg-card border rounded-xl p-6 max-w-3xl">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sku">Mã hàng</Label>
            <Input
              id="sku"
              required
              value={form.sku}
              onChange={(e) => updateField("sku", e.target.value)}
              placeholder="VD: VT-2025-0001"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Tên hàng hóa</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Nhập tên hàng hóa"
            />
          </div>

          <div className="space-y-2">
            <Label>Danh mục</Label>
            <Select
              value={form.categoryId}
              onValueChange={(val) => updateField("categoryId", val)}
              disabled={loadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? "Đang tải..." : "Chọn danh mục"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không phân loại</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Đơn vị tính</Label>
            <Input
              id="unit"
              required
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              placeholder="cái, bộ, cuộn..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">Xuất xứ</Label>
            <Input
              id="origin"
              required
              value={form.origin}
              onChange={(e) => updateField("origin", e.target.value)}
              placeholder="VN, EU, US..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Giá nhập</Label>
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
            <Label htmlFor="price">Giá xuất</Label>
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
            <Label htmlFor="minStock">Tồn tối thiểu</Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              step="0.01"
              value={form.minStock}
              onChange={(e) => updateField("minStock", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Ảnh sản phẩm</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                {preview || form.imageUrl ? (
                  <img src={preview || form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  disabled={uploading}
                />
                {form.imageUrl && (
                  <p className="text-xs text-muted-foreground break-all">Đã chọn: {form.imageUrl}</p>
                )}
                <Button type="button" variant="outline" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Đang tải..." : "Chọn ảnh"}
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/products">Hủy</Link>
            </Button>
            <Button type="submit" disabled={submitting || uploading}>
              <Plus className="w-4 h-4 mr-2" />
              {submitting ? "Đang lưu..." : "Thêm hàng hóa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;

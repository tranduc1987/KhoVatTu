import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/apiClient";
import DataTable, { type Column } from "@/components/common/DataTable";

interface Category {
  id: number;
  name: string;
  description?: string | null;
}

const Categories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const columns: Column<Category>[] = [
    { key: "name", header: "Ten danh muc" },
    {
      key: "description",
      header: "Mo ta",
      render: (item) => item.description || "—",
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Xoa">
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
      className: "text-right",
    },
  ];

  const load = async () => {
    try {
      const data = await apiFetch<Category[]>("/catalog/categories");
      setCategories(data);
    } catch (error) {
      toast({
        title: "Khong the tai danh muc",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Vui long nhap ten danh muc", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/catalog/categories", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
        }),
      });
      toast({ title: "Da them danh muc" });
      setForm({ name: "", description: "" });
      load();
    } catch (error) {
      toast({
        title: "Them danh muc that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/catalog/categories/${id}`, { method: "DELETE" });
      toast({ title: "Da xoa danh muc" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      toast({
        title: "Xoa that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Danh muc hang"
        description="Quan ly danh muc san pham/vat tu"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Danh muc" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Them danh muc</h3>
          <form className="space-y-3" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="name">Ten danh muc</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Thiet bi dien"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mo ta</Label>
              <Input
                id="desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Thong tin bo sung"
              />
            </div>
            <Button type="submit" disabled={saving}>
              <Plus className="w-4 h-4 mr-2" />
              {saving ? "Dang luu..." : "Them moi"}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={categories}
            keyExtractor={(item) => String(item.id)}
            emptyMessage="Chua co danh muc"
            isLoading={isLoading}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              onPageChange: () => {},
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Categories;

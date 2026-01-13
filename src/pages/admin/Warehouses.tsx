import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/apiClient";
import { Trash2, Plus } from "lucide-react";

interface Warehouse {
  id: number;
  name: string;
  location?: string | null;
}

const Warehouses = () => {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", location: "" });

  const columns: Column<Warehouse>[] = [
    { key: "name", header: "Ten kho" },
    { key: "location", header: "Dia chi", render: (item) => item.location || "—" },
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
      const data = await apiFetch<Warehouse[]>("/catalog/warehouses");
      setWarehouses(data);
    } catch (error) {
      toast({
        title: "Khong the tai danh sach kho",
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
      toast({ title: "Vui long nhap ten kho", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/catalog/warehouses", {
        method: "POST",
        body: JSON.stringify({ name: form.name.trim(), location: form.location.trim() || null }),
      });
      toast({ title: "Da them kho" });
      setForm({ name: "", location: "" });
      load();
    } catch (error) {
      toast({
        title: "Them kho that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/catalog/warehouses/${id}`, { method: "DELETE" });
      toast({ title: "Da xoa kho" });
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
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
        title="Kho hang"
        description="Quan ly kho nhap/xuat"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Kho" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Them kho</h3>
          <form className="space-y-3" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="name">Ten kho</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Kho Ha Long"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Dia chi</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Dia chi, ghi chu"
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
            data={warehouses}
            keyExtractor={(item) => String(item.id)}
            emptyMessage="Chua co kho"
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

export default Warehouses;

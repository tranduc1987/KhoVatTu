import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/apiClient";
import { Plus, Trash2 } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

const Suppliers = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const columns: Column<Supplier>[] = [
    { key: "name", header: "Nha cung cap" },
    { key: "phone", header: "Dien thoai", render: (item) => item.phone || "—" },
    { key: "email", header: "Email", render: (item) => item.email || "—" },
    { key: "address", header: "Dia chi", render: (item) => item.address || "—" },
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
      const data = await apiFetch<Supplier[]>("/catalog/suppliers");
      setSuppliers(data);
    } catch (error) {
      toast({
        title: "Khong the tai nha cung cap",
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
      toast({ title: "Vui long nhap ten nha cung cap", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/catalog/suppliers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
        }),
      });
      toast({ title: "Da them nha cung cap" });
      setForm({ name: "", phone: "", email: "", address: "" });
      load();
    } catch (error) {
      toast({
        title: "Them that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/catalog/suppliers/${id}`, { method: "DELETE" });
      toast({ title: "Da xoa nha cung cap" });
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
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
        title="Nha cung cap"
        description="Quan ly nha cung cap"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Nha cung cap" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Them nha cung cap</h3>
          <form className="space-y-3" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="name">Ten</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Cong ty ABC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Dien thoai</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="So lien he"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dia chi</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Dia chi"
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
            data={suppliers}
            keyExtractor={(item) => String(item.id)}
            emptyMessage="Chua co nha cung cap"
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

export default Suppliers;

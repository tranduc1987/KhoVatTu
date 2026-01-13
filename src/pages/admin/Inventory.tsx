import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface InventoryRow {
  id: number;
  quantity: number;
  warehouse_name: string;
  product_name: string;
  sku: string;
}

const Inventory = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns: Column<InventoryRow>[] = [
    { key: "sku", header: "SKU" },
    { key: "product_name", header: "Ten hang" },
    { key: "warehouse_name", header: "Kho" },
    {
      key: "quantity",
      header: "Ton",
      render: (item) => <span className="font-semibold">{item.quantity}</span>,
    },
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<InventoryRow[]>("/catalog/inventory");
        if (mounted) setRows(data);
      } catch (error) {
        toast({
          title: "Khong the tai ton kho",
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ton kho"
        description="Tong hop ton kho theo kho hang"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Ton kho" },
        ]}
      />

      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="Chua co du lieu ton kho"
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

export default Inventory;

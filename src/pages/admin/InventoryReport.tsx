import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiDownload, apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface InventoryRow {
  id: number;
  quantity: number;
  warehouse_name: string;
  product_name: string;
  sku: string;
}

const InventoryReport = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns: Column<InventoryRow & { total?: number }>[] = [
    { key: "sku", header: "SKU" },
    { key: "product_name", header: "Ten hang" },
    { key: "warehouse_name", header: "Kho" },
    {
      key: "quantity",
      header: "Ton",
      render: (item) => <span className="font-semibold">{item.quantity}</span>,
    },
    {
      key: "total",
      header: "Tong ton (SKU)",
      render: (item) => (item.total !== undefined ? <span>{item.total}</span> : null),
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
          title: "Khong the tai bao cao ton",
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

  const dataWithTotal = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach((row) => {
      totals[row.sku] = (totals[row.sku] || 0) + row.quantity;
    });
    return rows.map((row) => ({ ...row, total: totals[row.sku] }));
  }, [rows]);

  const handleExport = async () => {
    try {
      await apiDownload("/warehouse/exports/products/excel", "inventory-report.xlsx");
    } catch (error) {
      toast({
        title: "Xuat bao cao that bai",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bao cao ton kho"
        description="Tong hop ton kho theo kho va SKU"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Bao cao", href: "/admin/reports/inventory" },
          { label: "Ton kho" },
        ]}
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Xuat Excel
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={dataWithTotal}
        keyExtractor={(item) => `${item.id}-${item.warehouse_name}`}
        emptyMessage="Chua co du lieu ton"
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

export default InventoryReport;

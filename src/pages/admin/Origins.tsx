import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface ProductApi {
  id: number;
  sku: string;
  name: string;
  origin?: string | null;
}

interface OriginRow {
  origin: string;
  count: number;
}

const Origins = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<ProductApi[]>("/catalog/products");
        if (mounted) setProducts(data);
      } catch (error) {
        toast({
          title: "Khong the tai du lieu",
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

  const originRows: OriginRow[] = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const key = (p.origin || "Khong xac dinh").trim() || "Khong xac dinh";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const columns: Column<OriginRow>[] = [
    { key: "origin", header: "Xuat xu" },
    { key: "count", header: "So mat hang" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Xuat xu"
        description="Thong ke xuat xu theo danh sach hang hoa"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Xuat xu" },
        ]}
      />

      <DataTable
        columns={columns}
        data={originRows}
        keyExtractor={(item) => item.origin}
        emptyMessage="Chua co du lieu"
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

export default Origins;

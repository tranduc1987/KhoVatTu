import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import { Link } from "react-router-dom";
import { apiDownload, apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  origin: string;
  stock: number;
  minStock: number;
  unit: string;
  status: "active" | "inactive";
}

interface ProductApi {
  id: number;
  sku: string;
  name: string;
  category_name?: string | null;
  unit: string;
  min_stock: number;
}

interface InventoryApi {
  id: number;
  sku: string;
  quantity: number;
}

interface CategoryApi {
  id: number;
  name: string;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const columns: Column<Product>[] = [
    {
      key: "code",
      header: "Mã hàng",
      render: (item) => (
        <span className="font-mono text-sm font-medium">{item.code}</span>
      ),
    },
    {
      key: "name",
      header: "Tên hàng hóa",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Loại hàng",
      render: (item) => (
        <Badge variant="secondary">{item.category}</Badge>
      ),
    },
    {
      key: "origin",
      header: "Xuất xứ",
    },
    {
      key: "stock",
      header: "Tồn kho",
      render: (item) => {
        const isLow = item.stock <= item.minStock;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? "text-destructive font-semibold" : "font-medium"}>
              {item.stock}
            </span>
            <span className="text-muted-foreground text-sm">{item.unit}</span>
            {isLow && (
              <Badge variant="destructive" className="text-xs">Thấp</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status === "active" ? "Hoạt động" : "Ngừng"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/products/${item.id}`}>Chi tiết</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/products/${item.id}/edit`}>Sửa</Link>
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [productsData, inventoryData, categoriesData] = await Promise.all([
          apiFetch<ProductApi[]>("/catalog/products"),
          apiFetch<InventoryApi[]>("/catalog/inventory"),
          apiFetch<CategoryApi[]>("/catalog/categories"),
        ]);

        const inventoryBySku = inventoryData.reduce<Record<string, number>>((acc, item) => {
          acc[item.sku] = (acc[item.sku] || 0) + item.quantity;
          return acc;
        }, {});

        const mapped = productsData.map((product) => ({
          id: String(product.id),
          code: product.sku,
          name: product.name,
          category: product.category_name || "Chưa phân loại",
          origin: "Không xác định",
          stock: inventoryBySku[product.sku] || 0,
          minStock: product.min_stock,
          unit: product.unit,
          status: "active" as const,
        }));

        if (isMounted) {
          setProducts(mapped);
          setCategories(categoriesData.map((item) => item.name));
        }
      } catch (error) {
        toast({
          title: "Không thể tải dữ liệu",
          description: error instanceof Error ? error.message : "Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleExportExcel = async () => {
    try {
      await apiDownload("/warehouse/exports/products/excel", "products.xlsx");
    } catch (error) {
      toast({
        title: "Xuất Excel thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quản lý hàng hóa"
        description="Danh sách tất cả hàng hóa, thiết bị, vật tư trong kho"
        breadcrumbs={[
          { label: "Trang chủ", href: "/admin" },
          { label: "Hàng hóa" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button asChild>
              <Link to="/admin/products/create">
                <Plus className="w-4 h-4 mr-2" />
                Thêm mới
              </Link>
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc mã hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Loại hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy hàng hóa nào"
        isLoading={isLoading}
        pagination={{
          currentPage: 1,
          totalPages: 5,
          onPageChange: (page) => console.log("Page:", page),
        }}
      />
    </div>
  );
};

export default Products;

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Grid, List, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/apiClient";

type Product = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  origin: string;
  total_quantity: number;
};

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<Product[]>("/public/inventory");
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Khong the tai danh sach hang hoa.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const origins = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.origin));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchOrigin = originFilter === "all" || p.origin === originFilter;
      return matchSearch && matchOrigin;
    });
  }, [products, searchTerm, originFilter]);

  const renderCard = (p: Product) => (
    <Card
      key={p.id}
      className="p-4 hover:border-primary/40 transition-colors flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
          <img
            src={`https://via.placeholder.com/128?text=${encodeURIComponent(p.sku.slice(0, 6))}`}
            alt={p.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
          <h3 className="font-semibold line-clamp-2">{p.name}</h3>
          <p className="text-xs text-muted-foreground">Xuất xứ: {p.origin}</p>
          <p className="text-xs text-muted-foreground mt-1">ĐVT: {p.unit}</p>
        </div>
        <div className="text-right">
          <Badge variant={p.total_quantity > 0 ? "secondary" : "destructive"}>
            {p.total_quantity.toLocaleString()} {p.unit}
          </Badge>
          {p.total_quantity <= 0 && (
            <div className="flex items-center justify-end text-xs text-destructive mt-1 gap-1">
              <AlertTriangle className="w-3 h-3" /> Hết hàng
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderListRow = (p: Product) => (
    <div
      key={p.id}
      className="bg-card rounded-xl border p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
    >
      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
        <img
          src={`https://via.placeholder.com/128?text=${encodeURIComponent(p.sku.slice(0, 6))}`}
          alt={p.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
        <h3 className="font-semibold truncate">{p.name}</h3>
        <p className="text-sm text-muted-foreground">Xuất xứ: {p.origin}</p>
      </div>
      <div className="text-right">
        <Badge variant={p.total_quantity > 0 ? "secondary" : "destructive"}>
          {p.total_quantity.toLocaleString()} {p.unit}
        </Badge>
        <p className="text-xs text-muted-foreground mt-1">Tồn kho</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Danh mục hàng hóa</h1>
        <p className="text-muted-foreground">Tra cứu hàng trong kho và số lượng hiện có.</p>
      </div>

      <div className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên hoặc mã hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Xuất xứ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả xuất xứ</SelectItem>
                {origins.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Tìm thấy <span className="font-medium text-foreground">{filteredProducts.length}</span> mặt hàng
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border p-6 text-sm text-muted-foreground">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="bg-card rounded-xl border p-6 text-sm text-destructive">{error}</div>
      ) : filteredProducts.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
          {filteredProducts.map((p) => (viewMode === "grid" ? renderCard(p) : renderListRow(p)))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy mặt hàng phù hợp.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;

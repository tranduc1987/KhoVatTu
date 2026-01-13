import { useState } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/common/ProductCard";

// Mock data
const mockProducts = [
  { id: "1", code: "VT-2024-0001", name: "Bóng đèn LED 40W Rạng Đông", category: "Thiết bị điện", stock: 150, unit: "cái", minStock: 20 },
  { id: "2", code: "EQ-2024-0001", name: "Máy khoan cầm tay Bosch GSB 550", category: "Thiết bị cơ khí", stock: 8, unit: "chiếc", minStock: 5 },
  { id: "3", code: "VT-2024-0003", name: "Dây cáp điện CADIVI 2.5mm", category: "Vật tư điện", stock: 45, unit: "cuộn", minStock: 50 },
  { id: "4", code: "EQ-2024-0002", name: "Máy hàn điện tử Jasic ZX7-200E", category: "Thiết bị cơ khí", stock: 3, unit: "chiếc", minStock: 2 },
  { id: "5", code: "VT-2024-0004", name: "Ốc vít M8 x 25mm", category: "Vật tư cơ khí", stock: 500, unit: "cái", minStock: 100 },
  { id: "6", code: "VT-2024-0005", name: "Công tắc điện Panasonic", category: "Thiết bị điện", stock: 75, unit: "cái", minStock: 30 },
  { id: "7", code: "EQ-2024-0003", name: "Máy mài góc Makita GA4030", category: "Thiết bị cơ khí", stock: 5, unit: "chiếc", minStock: 3 },
  { id: "8", code: "VT-2024-0006", name: "Băng keo điện 3M", category: "Vật tư điện", stock: 200, unit: "cuộn", minStock: 50 },
];

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = mockProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Danh mục thiết bị</h1>
        <p className="text-muted-foreground">Tra cứu và tìm kiếm thiết bị, vật tư trong kho</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên hoặc mã thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Loại thiết bị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="Thiết bị điện">Thiết bị điện</SelectItem>
                <SelectItem value="Vật tư điện">Vật tư điện</SelectItem>
                <SelectItem value="Thiết bị cơ khí">Thiết bị cơ khí</SelectItem>
                <SelectItem value="Vật tư cơ khí">Vật tư cơ khí</SelectItem>
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

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Tìm thấy <span className="font-medium text-foreground">{filteredProducts.length}</span> thiết bị
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          : "space-y-3"
        }>
          {filteredProducts.map((product) => (
            viewMode === "grid" ? (
              <ProductCard key={product.id} {...product} />
            ) : (
              <div key={product.id} className="bg-card rounded-xl border p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-mono">{product.code}</p>
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.stock} {product.unit}</p>
                  <p className="text-xs text-muted-foreground">Tồn kho</p>
                </div>
                <Button variant="outline" size="sm">Chi tiết</Button>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy thiết bị nào phù hợp</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;

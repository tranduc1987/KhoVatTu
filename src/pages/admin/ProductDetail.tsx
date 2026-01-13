import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface ProductApi {
  id: number;
  sku: string;
  name: string;
  category_name?: string | null;
  unit: string;
  origin?: string | null;
  cost: number;
  price: number;
  min_stock: number;
}

interface InventoryApi {
  id: number;
  sku: string;
  quantity: number;
  warehouse_name: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductApi | null>(null);
  const [inventory, setInventory] = useState<InventoryApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const productId = Number(id);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [productsData, inventoryData] = await Promise.all([
          apiFetch<ProductApi[]>("/catalog/products"),
          apiFetch<InventoryApi[]>("/catalog/inventory"),
        ]);
        const target = productsData.find((p) => p.id === productId);
        if (!target) {
          toast({ title: "Khong tim thay hang hoa", variant: "destructive" });
        } else if (mounted) {
          setProduct(target);
        }
        if (mounted) setInventory(inventoryData);
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
  }, [productId, toast]);

  const totalStock = useMemo(() => {
    const sku = product?.sku;
    if (!sku) return 0;
    return inventory.filter((i) => i.sku === sku).reduce((sum, row) => sum + row.quantity, 0);
  }, [inventory, product]);

  const warehouseBreakdown = useMemo(() => {
    const sku = product?.sku;
    if (!sku) return [];
    return inventory.filter((i) => i.sku === sku);
  }, [inventory, product]);

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Dang tai du lieu...</div>;
  }

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-destructive font-medium">Khong tim thay hang hoa.</p>
        <Button className="mt-3" asChild>
          <Link to="/admin/products">Quay lai danh sach</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Chi tiet: ${product.name}`}
        description="Thong tin san pham/vat tu"
        breadcrumbs={[
          { label: "Trang chu", href: "/admin" },
          { label: "Hang hoa", href: "/admin/products" },
          { label: product.sku },
        ]}
        actions={
          <Button asChild>
            <Link to={`/admin/products/${product.id}/edit`}>Chinh sua</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Thong tin chinh</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Ma hang</p>
            <p className="font-mono font-semibold">{product.sku}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ten hang</p>
            <p className="font-semibold">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Danh muc</p>
            <p>{product.category_name || "Khong phan loai"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Xuat xu</p>
            <p>{product.origin || "Khong xac dinh"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Don vi</p>
            <p>{product.unit}</p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Ton toi thieu</p>
              <p>
                {product.min_stock} {product.unit}
              </p>
            </div>
            <Badge variant={totalStock < product.min_stock ? "destructive" : "secondary"}>
              Ton hien tai: {totalStock} {product.unit}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gia nhap</p>
            <p>{product.cost}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gia xuat</p>
            <p>{product.price}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ton theo kho</CardTitle>
        </CardHeader>
        <CardContent>
          {warehouseBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">Chua co du lieu ton kho.</p>
          ) : (
            <div className="space-y-2">
              {warehouseBreakdown.map((row) => (
                <div
                  key={`${row.warehouse_name}-${row.id}`}
                  className="flex items-center justify-between border rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{row.warehouse_name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>
                  </div>
                  <Badge variant="secondary">
                    {row.quantity} {product.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;

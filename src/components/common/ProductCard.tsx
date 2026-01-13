import { Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  image?: string;
}

const ProductCard = ({
  id,
  code,
  name,
  category,
  stock,
  unit,
  minStock,
  image,
}: ProductCardProps) => {
  const isLowStock = stock <= minStock;
  const isOutOfStock = stock === 0;

  return (
    <div className="bg-card rounded-xl border card-elevated overflow-hidden group">
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <Badge variant="destructive">Hết hàng</Badge>
          ) : isLowStock ? (
            <Badge className="bg-warning text-warning-foreground">Sắp hết</Badge>
          ) : (
            <Badge className="bg-success text-success-foreground">Còn hàng</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{code}</p>
          <h3 className="font-semibold text-foreground line-clamp-2 mt-1">{name}</h3>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{category}</span>
          <span className="font-medium">
            {stock} <span className="text-muted-foreground">{unit}</span>
          </span>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/products/${id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;

import { ArrowRight, Package, Shield, Clock, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "@/components/common/ProductCard";

// Mock featured products
const featuredProducts = [
  { id: "1", code: "VT-2024-0001", name: "Bóng đèn LED 40W Rạng Đông", category: "Thiết bị điện", stock: 150, unit: "cái", minStock: 20 },
  { id: "2", code: "EQ-2024-0001", name: "Máy khoan cầm tay Bosch GSB 550", category: "Thiết bị cơ khí", stock: 8, unit: "chiếc", minStock: 5 },
  { id: "3", code: "VT-2024-0003", name: "Dây cáp điện CADIVI 2.5mm", category: "Vật tư điện", stock: 45, unit: "cuộn", minStock: 50 },
  { id: "4", code: "EQ-2024-0002", name: "Máy hàn điện tử Jasic ZX7-200E", category: "Thiết bị cơ khí", stock: 3, unit: "chiếc", minStock: 2 },
];

const features = [
  {
    icon: Package,
    title: "Quản lý đầy đủ",
    description: "Theo dõi hàng hóa, thiết bị từ nhập đến xuất với đầy đủ thông tin",
  },
  {
    icon: Shield,
    title: "An toàn & Bảo mật",
    description: "Dữ liệu được mã hóa, phân quyền chặt chẽ theo vai trò",
  },
  {
    icon: Clock,
    title: "Cập nhật tức thời",
    description: "Thông tin tồn kho được cập nhật ngay lập tức sau mỗi giao dịch",
  },
  {
    icon: Users,
    title: "Đa người dùng",
    description: "Hỗ trợ nhiều người dùng làm việc đồng thời với phân quyền rõ ràng",
  },
];

const news = [
  {
    id: 1,
    title: "Hướng dẫn quy trình nhập kho mới",
    date: "15/01/2024",
    excerpt: "Quy trình nhập kho được cập nhật với các bước kiểm tra chất lượng mới...",
  },
  {
    id: 2,
    title: "Thông báo bảo trì hệ thống",
    date: "12/01/2024",
    excerpt: "Hệ thống sẽ được bảo trì từ 22h ngày 20/01 đến 6h ngày 21/01...",
  },
  {
    id: 3,
    title: "Ra mắt tính năng báo cáo mới",
    date: "10/01/2024",
    excerpt: "Tính năng báo cáo tồn kho theo thời gian thực đã được cập nhật...",
  },
];

const Home = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hệ thống Quản lý Kho
            <span className="text-accent block mt-1">VOSA Quảng Ninh</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-6">
            Giải pháp quản lý vật tư, thiết bị toàn diện - Tra cứu nhanh chóng, 
            báo cáo chính xác, tối ưu hiệu quả vận hành.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
              <Link to="/products">
                Tra cứu thiết bị
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/about">Tìm hiểu thêm</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Thiết bị nổi bật</h2>
            <p className="text-muted-foreground text-sm">Các thiết bị, vật tư thường dùng</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/products">
              Xem tất cả
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-card rounded-2xl border p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 text-center">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* News */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Tin tức & Thông báo</h2>
            <p className="text-muted-foreground text-sm">Cập nhật mới nhất từ hệ thống</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/news">
              Xem tất cả
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {news.map((item) => (
            <article key={item.id} className="bg-card rounded-xl border p-5 card-elevated hover:border-primary/30 transition-colors">
              <time className="text-xs text-muted-foreground">{item.date}</time>
              <h3 className="font-semibold mt-2 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
              <Link to={`/news/${item.id}`} className="text-sm text-primary font-medium mt-3 inline-flex items-center hover:underline">
                Đọc thêm <ChevronRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

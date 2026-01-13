import { Package, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold">HIỆN TRƯỜNG VOSAQN</h3>
                <p className="text-xs text-background/70">Quản lý Kho Vật tư</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Hệ thống quản lý kho vật tư thiết bị hiện đại, đáp ứng mọi nhu cầu quản lý và tra cứu của doanh nghiệp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/products" className="hover:text-accent transition-colors">Danh mục thiết bị</Link></li>
              <li><Link to="/news" className="hover:text-accent transition-colors">Tin tức</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">Giới thiệu</Link></li>
              <li><Link to="/help" className="hover:text-accent transition-colors">Hướng dẫn sử dụng</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/faq" className="hover:text-accent transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Liên hệ</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
                <span>Số 123, Đường ABC, TP. Hạ Long, Quảng Ninh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-accent" />
                <span>0203 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-accent" />
                <span>contact@vosaquangninh.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© 2024 VOSA Quảng Ninh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  return (
    <header className="h-16 bg-card border-b border-border px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-80">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm hàng hóa, phiếu kho..."
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Cảnh báo tồn kho thấp</span>
              <span className="text-xs text-muted-foreground">5 mặt hàng dưới mức tối thiểu</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Phiếu nhập mới</span>
              <span className="text-xs text-muted-foreground">PN-20240115-0001 cần xác nhận</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Admin VOSA</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Thông tin cá nhân</DropdownMenuItem>
            <DropdownMenuItem>Đổi mật khẩu</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

type UserRow = {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  is_active: number;
  roles?: string | null;
  created_at?: string;
};

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<UserRow[]>("/auth/users");
        if (mounted) setUsers(data);
      } catch (error) {
        toast({
          title: "Không thể tải danh sách người dùng",
          description: error instanceof Error ? error.message : "Vui lòng thử lại.",
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

  const handleToggle = async (user: UserRow) => {
    setUpdatingId(user.id);
    try {
      await apiFetch(`/auth/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: user.is_active ? 0 : 1 }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: user.is_active ? 0 : 1 } : u))
      );
      toast({ title: "Cập nhật trạng thái thành công" });
    } catch (error) {
      toast({
        title: "Không thể cập nhật trạng thái",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filter === "active") return u.is_active === 1;
      if (filter === "inactive") return u.is_active === 0;
      return true;
    });
  }, [users, filter]);

  const columns: Column<UserRow>[] = [
    {
      key: "username",
      header: "Tài khoản",
      render: (item) => (
        <div>
          <p className="font-semibold">{item.username}</p>
          <p className="text-xs text-muted-foreground">{item.email || "--"}</p>
        </div>
      ),
    },
    { key: "full_name", header: "Họ tên" },
    {
      key: "roles",
      header: "Vai trò",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.roles || "")
            .split(",")
            .filter(Boolean)
            .map((r) => (
              <Badge key={r} variant="outline">
                {r}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Trạng thái",
      render: (item) =>
        item.is_active ? (
          <Badge className="bg-success text-success-foreground">Hoạt động</Badge>
        ) : (
          <Badge variant="destructive">Đã khóa</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <Button
          size="sm"
          variant={item.is_active ? "outline" : "secondary"}
          disabled={updatingId === item.id}
          onClick={() => handleToggle(item)}
        >
          {item.is_active ? <ShieldOff className="w-4 h-4 mr-1" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
          {item.is_active ? "Khóa" : "Mở khóa"}
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Người dùng"
        description="Quản lý tài khoản và trạng thái truy cập."
        breadcrumbs={[
          { label: "Trang chủ", href: "/admin" },
          { label: "Người dùng" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "secondary" : "outline"} onClick={() => setFilter("all")}>
              Tất cả
            </Button>
            <Button variant={filter === "active" ? "secondary" : "outline"} onClick={() => setFilter("active")}>
              Hoạt động
            </Button>
            <Button variant={filter === "inactive" ? "secondary" : "outline"} onClick={() => setFilter("inactive")}>
              Đã khóa
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="Chưa có người dùng."
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

export default Users;

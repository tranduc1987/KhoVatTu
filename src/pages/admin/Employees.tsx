import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type Column } from "@/components/common/DataTable";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, ShieldOff } from "lucide-react";

type Employee = {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  is_active: number;
  roles?: string | null;
  created_at?: string;
};

const Employees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiFetch<Employee[]>("/auth/users");
        if (mounted) setEmployees(data);
      } catch (error) {
        toast({
          title: "Không thể tải danh sách nhân viên",
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

  const handleToggle = async (employee: Employee) => {
    setUpdatingId(employee.id);
    try {
      await apiFetch(`/auth/users/${employee.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: employee.is_active ? 0 : 1 }),
      });
      setEmployees((prev) =>
        prev.map((e) => (e.id === employee.id ? { ...e, is_active: employee.is_active ? 0 : 1 } : e))
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
    return employees.filter((e) => {
      if (filter === "active") return e.is_active === 1;
      if (filter === "inactive") return e.is_active === 0;
      return true;
    });
  }, [employees, filter]);

  const columns: Column<Employee>[] = [
    {
      key: "full_name",
      header: "Họ tên",
      render: (item) => (
        <div>
          <p className="font-semibold">{item.full_name}</p>
          <p className="text-xs text-muted-foreground">{item.username}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (item) => item.email || "--",
    },
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
        title="Nhân viên"
        description="Quản lý trạng thái và vai trò nhân viên."
        breadcrumbs={[
          { label: "Trang chủ", href: "/admin" },
          { label: "Nhân viên" },
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
        emptyMessage="Chưa có nhân viên."
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

export default Employees;

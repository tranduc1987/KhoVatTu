import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/apiClient";

type Vehicle = {
  id: number;
  nm: string;
  dl?: { id: string }[];
  pid?: number;
};

type Company = { id: number; nm: string; pid?: number };

type SimInfo = {
  id: number;
  cardNum: string;
  devIDNO?: string;
  vehiIDNO?: string;
  operator?: string;
  status?: number;
  registrationTime?: number;
};

type DevicesSimsResponse = {
  vehicles: Vehicle[];
  companies: Company[];
  sims: SimInfo[];
};

const statusLabel = (status?: number) => {
  if (status === 1) return "Dang hoat dong";
  if (status === 0) return "Khong hoat dong";
  return "Khong ro";
};

const DeviceSimSync = () => {
  const { data, isLoading, isError, refetch, error, isFetching } = useQuery<DevicesSimsResponse>({
    queryKey: ["integrations", "devices-sims"],
    queryFn: () => apiFetch<DevicesSimsResponse>("/integrations/devices-sims"),
  });

  const companyNameMap =
    data?.companies?.reduce<Record<number, string>>((acc, c) => {
      acc[c.id] = c.nm;
      return acc;
    }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dong bo thiet bi & SIM</h1>
          <p className="text-sm text-muted-foreground">
            Lay danh sach thiet bi va SIM tu may chu ngoai (account vosaqn) de tham khao va nhap vao kho.
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Dang tai..." : "Lam moi"}
        </Button>
      </div>

      {isLoading && <p>Dang tai du lieu...</p>}
      {isError && <p className="text-destructive">Khong the tai du lieu: {(error as Error)?.message}</p>}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thiet bi / Xe ({data.vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Bien so</TableHead>
                    <TableHead>Cong ty</TableHead>
                    <TableHead>So thiet bi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.vehicles.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell>{item.nm}</TableCell>
                      <TableCell>{companyNameMap[item.pid as number] || "N/A"}</TableCell>
                      <TableCell>{item.dl?.length || 0}</TableCell>
                    </TableRow>
                  ))}
                  {data.vehicles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Khong co du lieu thiet bi.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SIM ({data.sims.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>So SIM</TableHead>
                    <TableHead>Thiet bi</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead>Nha mang</TableHead>
                    <TableHead>Trang thai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sims.map((sim) => (
                    <TableRow key={sim.id}>
                      <TableCell className="font-mono text-xs">{sim.id}</TableCell>
                      <TableCell>{sim.cardNum || "N/A"}</TableCell>
                      <TableCell>{sim.devIDNO || "N/A"}</TableCell>
                      <TableCell>{sim.vehiIDNO || "N/A"}</TableCell>
                      <TableCell>{sim.operator || "N/A"}</TableCell>
                      <TableCell>{statusLabel(sim.status)}</TableCell>
                    </TableRow>
                  ))}
                  {data.sims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Khong co du lieu SIM.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeviceSimSync;

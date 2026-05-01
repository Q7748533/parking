import {
  Plane,
  Car,
  DollarSign,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { turso } from "@/lib/db";

async function getDashboardStats() {
  const [airportResult, providerResult, priceResult] = await Promise.all([
    turso.execute("SELECT COUNT(*) as total FROM airports"),
    turso.execute("SELECT COUNT(*) as total FROM parking_providers"),
    turso.execute("SELECT COALESCE(AVG(price_per_day), 0) as avg_price FROM parking_providers"),
  ]);

  return {
    totalAirports: Number(airportResult.rows[0]?.total ?? 0),
    totalProviders: Number(providerResult.rows[0]?.total ?? 0),
    avgPricePerDay: Number(priceResult.rows[0]?.avg_price ?? 0),
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
        <p className="text-muted-foreground mt-1">
          AirportMatrix 停车场数据概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              机场数量
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Plane className="w-4 h-4 text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAirports}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/admin/airports" className="text-violet-400 hover:underline inline-flex items-center gap-1">
                管理机场 <ArrowUpRight className="w-3 h-3" />
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              停车场
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Car className="w-4 h-4 text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProviders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/admin/parking" className="text-violet-400 hover:underline inline-flex items-center gap-1">
                管理停车场 <ArrowUpRight className="w-3 h-3" />
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              日均价
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgPricePerDay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">全部停车场均价</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              覆盖范围
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">US</div>
            <p className="text-xs text-muted-foreground mt-1">全美机场停车覆盖</p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/airports"
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">机场管理</p>
                <p className="text-xs text-muted-foreground">添加、编辑或删除机场数据</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/parking"
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">停车场管理</p>
                <p className="text-xs text-muted-foreground">管理停车场及其详细信息</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

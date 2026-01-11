import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link as LinkIcon, Image, Package, Mail, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: stats = [] } = trpc.links.stats.useQuery();
  const { data: links = [] } = trpc.links.listAll.useQuery();
  const { data: carouselImages = [] } = trpc.carousel.listAll.useQuery();
  const { data: products = [] } = trpc.products.listAll.useQuery();
  const { data: subscribers = [] } = trpc.newsletter.list.useQuery();

  const totalClicks = stats.reduce((sum, stat) => sum + Number(stat.clickCount), 0);
  const chartData = stats.slice(0, 10).map(stat => ({
    name: stat.linkTitle.length > 20 ? stat.linkTitle.substring(0, 20) + '...' : stat.linkTitle,
    clicks: Number(stat.clickCount),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">프로필 링크 페이지 통계 및 관리</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 링크</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.length}</div>
            <p className="text-xs text-muted-foreground">
              활성: {links.filter(l => l.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 클릭 수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              모든 링크 합계
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">캐러셀 이미지</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carouselImages.length}</div>
            <p className="text-xs text-muted-foreground">
              활성: {carouselImages.filter(i => i.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">제품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              활성: {products.filter(p => p.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Click Statistics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>링크 클릭 통계</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              아직 클릭 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Subscribers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>최근 구독자</CardTitle>
          <Mail className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {subscribers.length > 0 ? (
            <div className="space-y-2">
              {subscribers.slice(0, 5).map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{subscriber.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(subscriber.subscribedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))}
              {subscribers.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  외 {subscribers.length - 5}명
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              아직 구독자가 없습니다
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

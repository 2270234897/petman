import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Calendar, Package, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { useDashboardStats, useDashboardActivities } from "@/hooks/useApi"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useMobile } from "@/hooks/useMobile"
import { MobileDashboard } from "./mobile-dashboard"

const statsConfig = [
  {
    title: "总宠物数",
    key: "totalPets" as const,
    change: "+12%",
    changeType: "positive" as const,
    icon: Heart,
    color: "vibrant-card-pink",
  },
  {
    title: "活跃客户",
    key: "activeCustomers" as const,
    change: "+8%",
    changeType: "positive" as const,
    icon: Users,
    color: "vibrant-card-blue",
  },
  {
    title: "今日预约",
    key: "todayAppointments" as const,
    change: "+5%",
    changeType: "positive" as const,
    icon: Calendar,
    color: "vibrant-card-orange",
  },
  {
    title: "库存预警",
    key: "lowStockItems" as const,
    change: "-2",
    changeType: "negative" as const,
    icon: AlertTriangle,
    color: "vibrant-card-teal",
  },
]

export function Dashboard() {
  const isMobile = useMobile()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activities, isLoading: activitiesLoading } = useDashboardActivities()
  const navigate = useNavigate()

  // Use mobile-optimized dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard />
  }

  // 处理快速操作按钮点击
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "addPet":
        navigate("/pets")
        toast.success("正在跳转到宠物管理页面")
        break
      case "addAppointment":
        navigate("/appointments")
        toast.success("正在跳转到预约管理页面")
        break
      case "addStock":
        navigate("/inventory")
        toast.success("正在跳转到库存管理页面")
        break
      case "manageCustomers":
        navigate("/customers")
        toast.success("正在跳转到客户管理页面")
        break
      default:
        toast.info("功能开发中...")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          欢迎回来！这是您的宠物管理系统概览。
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title} className={`card-hover ${stat.color} border-2 bounce-in`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">加载中...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats ? stats[stat.key].toLocaleString() : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>{" "}
                    相比上月
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4 card-hover vibrant-card-blue border-2">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              系统最新动态和重要通知
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">加载中...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {activities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="h-2 w-2 rounded-full bg-primary pulse-animation" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 card-hover vibrant-card-purple border-2">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用功能的快捷入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors button-hover bg-pink-50 dark:bg-pink-900/20" onClick={() => handleQuickAction("addPet")}>
                <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium">新增宠物</span>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors button-hover bg-blue-50 dark:bg-blue-900/20" onClick={() => handleQuickAction("addAppointment")}>
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">预约登记</span>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors button-hover bg-orange-50 dark:bg-orange-900/20" onClick={() => handleQuickAction("addStock")}>
                <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium">库存入库</span>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors button-hover bg-teal-50 dark:bg-teal-900/20" onClick={() => handleQuickAction("manageCustomers")}>
                <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium">客户管理</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
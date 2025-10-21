import React from "react";
import { Calendar, Users, Package, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api-client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  link: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, trend, color, link, loading }: StatCardProps) {
  return (
    <Link
      to={link}
      className={cn(
        "block p-4 rounded-lg border bg-card hover:shadow-md transition-all",
        "active:scale-95"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-muted rounded animate-pulse mt-1" />
          ) : (
            <>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {trend && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend}
                </p>
              )}
            </>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", color)}>
          {icon}
        </div>
      </div>
    </Link>
  );
}

export function MobileDashboard() {
  // 使用简单的状态管理，避免复杂的 API 调用
  const [stats, setStats] = React.useState({
    appointments: 0,
    customers: 0,
    products: 0,
    lowStock: 0,
    loading: true,
  });

  React.useEffect(() => {
    // 异步获取数据
    const fetchData = async () => {
      try {
        const [appointmentsRes, customersRes, productsRes] = await Promise.all([
          api.get("/api/appointments/get").catch(() => ({ data: { data: [] } })),
          api.get("/api/customers/get").catch(() => ({ data: { data: [] } })),
          api.get("/api/inventory/products").catch(() => ({ data: { data: [] } })),
        ]);

        const appointmentsData = appointmentsRes.data?.data || [];
        const customersData = customersRes.data?.data || [];
        const productsData = productsRes.data?.data || [];

        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = appointmentsData.filter(
          (apt: any) => apt.appointment_date?.startsWith(today)
        );

        setStats({
          appointments: todayAppointments.length,
          customers: customersData.length,
          products: productsData.length,
          lowStock: productsData.filter((p: any) => (p.stock || 0) < 10).length,
          loading: false,
        });
      } catch (error) {
        console.error("获取数据失败:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "今日预约",
      value: stats.appointments,
      icon: <Calendar className="h-5 w-5 text-white" />,
      color: "bg-blue-500",
      link: "/appointments",
      loading: stats.loading,
    },
    {
      title: "客户总数",
      value: stats.customers,
      icon: <Users className="h-5 w-5 text-white" />,
      color: "bg-green-500",
      link: "/customers",
      loading: stats.loading,
    },
    {
      title: "库存商品",
      value: stats.products,
      icon: <Package className="h-5 w-5 text-white" />,
      color: "bg-purple-500",
      link: "/inventory",
      loading: stats.loading,
    },
    {
      title: "低库存",
      value: stats.lowStock,
      icon: <AlertCircle className="h-5 w-5 text-white" />,
      color: "bg-red-500",
      link: "/inventory/stock",
      loading: stats.loading,
    },
  ];

  // 最近活动（基于真实数据）
  const recentActivities = [
    {
      title: "今日预约",
      description: `${stats.appointments} 个预约待处理`,
      time: "今天",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "客户管理",
      description: `当前共有 ${stats.customers} 位客户`,
      time: "实时",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "库存提醒",
      description: `${stats.lowStock} 个商品库存不足`,
      time: "系统提醒",
      icon: <AlertCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">欢迎回来! 👋</h1>
        <p className="text-blue-100">今天是 {new Date().toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/appointments"
            className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors active:scale-95"
          >
            <Calendar className="h-6 w-6 mb-2 text-blue-500" />
            <span className="text-sm font-medium">新建预约</span>
          </Link>
          <Link
            to="/customers"
            className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors active:scale-95"
          >
            <Users className="h-6 w-6 mb-2 text-green-500" />
            <span className="text-sm font-medium">添加客户</span>
          </Link>
          <Link
            to="/inventory"
            className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors active:scale-95"
          >
            <Package className="h-6 w-6 mb-2 text-purple-500" />
            <span className="text-sm font-medium">库存管理</span>
          </Link>
          {/* AI features disabled - moved to archive */}
          {/* <Link
            to="/image-recognition"
            className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors active:scale-95"
          >
            <Package className="h-6 w-6 mb-2 text-orange-500" />
            <span className="text-sm font-medium">图像识别</span>
          </Link> */}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-3">最近动态</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


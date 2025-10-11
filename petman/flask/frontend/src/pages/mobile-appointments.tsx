import { Calendar, Clock, User, Phone, ChevronRight, Plus } from "lucide-react";
import { MobileCard } from "@/components/ui/mobile-card";
import { MobileFAB } from "@/components/ui/mobile-fab";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentsApi } from "@/services/api";

const statusConfig = {
  pending: { label: "待确认", color: "text-yellow-600 bg-yellow-50" },
  confirmed: { label: "已确认", color: "text-blue-600 bg-blue-50" },
  completed: { label: "已完成", color: "text-green-600 bg-green-50" },
  cancelled: { label: "已取消", color: "text-gray-600 bg-gray-50" },
  待确认: { label: "待确认", color: "text-yellow-600 bg-yellow-50" },
  已确认: { label: "已确认", color: "text-blue-600 bg-blue-50" },
  已完成: { label: "已完成", color: "text-green-600 bg-green-50" },
  已取消: { label: "已取消", color: "text-gray-600 bg-gray-50" },
};

export function MobileAppointments() {
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("today");

  // 获取真实预约数据
  const { data, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsApi.getAll(),
  });

  const appointmentsData = data?.data || [];
  const today = new Date().toISOString().split("T")[0];

  // 根据筛选条件过滤数据
  const filteredAppointments = appointmentsData.filter((apt: any) => {
    const aptDate = apt.appointment_date?.split("T")[0] || apt.appointment_date;
    if (filter === "today") {
      return aptDate === today;
    } else if (filter === "upcoming") {
      return aptDate >= today;
    }
    return true;
  });

  const filters = [
    { key: "today", label: "今天" },
    { key: "upcoming", label: "即将到来" },
    { key: "all", label: "全部" },
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">预约管理</h1>
        <p className="text-sm text-muted-foreground">
          共 {appointments.length} 个预约
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border bg-card">
              <div className="h-4 bg-muted rounded w-1/3 mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Appointments List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredAppointments.map((appointment: any) => {
            const status = appointment.status || "pending";
            const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
            
            return (
              <MobileCard key={appointment.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{appointment.customer_name || "客户"}</h3>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      宠物: {appointment.pet_name || "待定"}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{appointment.appointment_date?.split("T")[0] || appointment.appointment_date}</span>
                    <Clock className="h-4 w-4 ml-4 mr-2 text-muted-foreground" />
                    <span>{appointment.appointment_time || "待定"}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{appointment.service_name || "服务"}</span>
                  </div>

                  {appointment.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{appointment.phone}</span>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                  </div>
                )}
              </MobileCard>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">暂无预约</p>
        </div>
      )}

      {/* FAB */}
      <MobileFAB 
        onClick={() => console.log("Add appointment")} 
        icon={<Plus />}
        label="新建预约" 
      />
    </div>
  );
}


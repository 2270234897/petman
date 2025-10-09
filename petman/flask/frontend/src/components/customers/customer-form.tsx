import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useCreateCustomer } from "@/hooks/useApi"
import { toast } from "sonner"

interface CustomerFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({ onSuccess, onCancel }: CustomerFormProps) {
  const [form, setForm] = useState({
    customername: "",
    gender: "",
    telphone: "",
    address: "",
    Membershiplevel: "1",
    membership_balance: "0",
  })

  const createCustomer = useCreateCustomer()

  const onSubmit = async () => {
    if (!form.customername || !form.gender || !form.telphone) {
      toast.error("请填写所有必填字段（姓名、性别、电话）")
      return
    }

    try {
      await createCustomer.mutateAsync({
        ...form,
        Membershiplevel: Number(form.Membershiplevel),
        membership_balance: Number(form.membership_balance),
      })
      onSuccess?.()
    } catch (error) {
      console.error("创建客户失败:", error)
    }
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>新增客户</CardTitle>
        <CardDescription>填写客户信息后提交</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">客户姓名 *</label>
            <Input 
              placeholder="请输入客户姓名" 
              value={form.customername} 
              onChange={e => setForm({...form, customername: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">性别 *</label>
            <Input 
              placeholder="请输入性别" 
              value={form.gender} 
              onChange={e => setForm({...form, gender: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">电话 *</label>
            <Input 
              placeholder="请输入电话号码" 
              value={form.telphone} 
              onChange={e => setForm({...form, telphone: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">会员等级</label>
            <Input 
              type="number"
              placeholder="请输入会员等级" 
              value={form.Membershiplevel} 
              onChange={e => setForm({...form, Membershiplevel: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">会员余额</label>
            <Input 
              type="number"
              placeholder="请输入会员余额" 
              value={form.membership_balance} 
              onChange={e => setForm({...form, membership_balance: e.target.value})} 
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">地址（可选）</label>
            <Input 
              placeholder="请输入地址，不填写默认为'未知地址'" 
              value={form.address} 
              onChange={e => setForm({...form, address: e.target.value})} 
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onSubmit} disabled={createCustomer.isPending}>
            {createCustomer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            提交
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Plus, Search, Filter, MoreHorizontal, Loader2, Trash2 } from "lucide-react"
import { usePets, useCreatePet, useDeletePet } from "@/hooks/useApi"
import { toast } from "sonner"

export function Pets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    petname: "",
    pet_species: "",
    pet_breeds: "",
    pet_gender: "",
    pet_age: "",
    customer_id: "",
    pet_image: "",
    neuter: false,
  })

  const { data, isLoading, refetch } = usePets()
  const createPet = useCreatePet()
  const deletePet = useDeletePet()

  const pets = (data?.data ?? []) as any[]
  const filteredPets = pets.filter(pet => {
    const name = (pet.petname ?? "").toLowerCase()
    const owner = (pet.owner_name ?? "").toLowerCase()
    return name.includes(searchTerm.toLowerCase()) || owner.includes(searchTerm.toLowerCase())
  })

  const onSubmit = async () => {
    if (!form.petname || !form.pet_species || !form.pet_breeds || !form.pet_gender || !form.pet_age || !form.customer_id) {
      toast.error("请填写所有必填字段")
      return
    }
    await createPet.mutateAsync({
      ...form,
      pet_age: Number(form.pet_age),
      customer_id: Number(form.customer_id),
    })
    setShowCreate(false)
    setForm({ petname: "", pet_species: "", pet_breeds: "", pet_gender: "", pet_age: "", customer_id: "", pet_image: "", neuter: false })
    refetch()
  }

  // 处理查看详情按钮点击
  const handleViewDetails = (petId: number, petName: string) => {
    toast.info(`查看宠物详情: ${petName}`)
    // 这里可以添加实际的查看详情逻辑
  }

  // 处理删除按钮点击
  const handleDelete = (petId: number, petName: string) => {
    toast.info(`确定要删除宠物 ${petName} 吗？`, {
      action: {
        label: "确认",
        onClick: () => {
          // 实际的删除逻辑
          deletePet.mutateAsync(petId)
        }
      }
    })
  }

  // 处理更多操作按钮点击
  const handleMoreActions = (petId: number, petName: string) => {
    toast.info(`更多操作: ${petName}`)
    // 这里可以添加实际的更多操作逻辑
  }

  // 处理新增宠物按钮点击
  const handleAddPet = () => {
    setShowCreate(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">宠物管理</h1>
          <p className="text-muted-foreground">管理所有宠物信息</p>
        </div>
        <Button className="button-hover btn-vibrant-pink" onClick={handleAddPet}>
          <Plus className="mr-2 h-4 w-4" />
          新增宠物
        </Button>
      </div>

      <Card className="vibrant-card-blue border-2">
        <CardHeader>
          <CardTitle>搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索宠物名称或主人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="btn-vibrant-blue">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <Card className="card-hover vibrant-card-pink border-2 bounce-in">
          <CardHeader>
            <CardTitle>新增宠物</CardTitle>
            <CardDescription>填写必要信息后提交</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input placeholder="宠物名称（petname）" value={form.petname} onChange={e=>setForm({...form, petname:e.target.value})} />
            <Input placeholder="品种（pet_breeds）" value={form.pet_breeds} onChange={e=>setForm({...form, pet_breeds:e.target.value})} />
            <Input placeholder="物种（pet_species）" value={form.pet_species} onChange={e=>setForm({...form, pet_species:e.target.value})} />
            <Input placeholder="性别（pet_gender）" value={form.pet_gender} onChange={e=>setForm({...form, pet_gender:e.target.value})} />
            <Input placeholder="年龄（pet_age）数字" value={form.pet_age} onChange={e=>setForm({...form, pet_age:e.target.value})} />
            <Input placeholder="主人ID（customer_id）" value={form.customer_id} onChange={e=>setForm({...form, customer_id:e.target.value})} />
            <Input placeholder="宠物图片URL（pet_image）" value={form.pet_image} onChange={e=>setForm({...form, pet_image:e.target.value})} />
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="neuter" 
                checked={form.neuter} 
                onChange={e=>setForm({...form, neuter:e.target.checked})}
                className="rounded"
              />
              <label htmlFor="neuter" className="text-sm font-medium">已绝育</label>
            </div>
            <div className="col-span-full flex gap-2">
              <Button onClick={onSubmit} disabled={createPet.isPending} className="btn-vibrant-green">
                {createPet.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 提交
              </Button>
              <Button variant="outline" onClick={()=>setShowCreate(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> 加载中...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet: any) => (
            <Card key={pet.pet_id} className="hover:shadow-md transition-shadow vibrant-card-orange border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <CardTitle className="text-lg">{pet.petname}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoreActions(pet.pet_id, pet.petname)}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {pet.pet_species} · {pet.pet_breeds} · {pet.pet_age}岁
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">主人</span>
                  <span className="font-medium">{pet.owner_name ?? '-'}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(pet.pet_id, pet.petname)}>查看详情</Button>
                  <Button variant="destructive" size="sm" className="flex-0" onClick={() => handleDelete(pet.pet_id, pet.petname)}> <Trash2 className="h-4 w-4"/> </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredPets.length === 0 && (
        <Card className="vibrant-card-teal border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无宠物数据</h3>
            <p className="text-muted-foreground text-center mb-4">没有找到匹配的宠物信息，请尝试调整搜索条件</p>
            <Button onClick={handleAddPet} className="btn-vibrant-pink">
              <Plus className="mr-2 h-4 w-4" />
              添加第一个宠物
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
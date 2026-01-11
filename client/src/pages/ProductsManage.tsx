import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function ProductsManage() {
  const { data: products = [] } = trpc.products.listAll.useQuery();
  const utils = trpc.useUtils();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    affiliateUrl: "",
    price: "",
    sortOrder: 0,
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("제품이 추가되었습니다");
      utils.products.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("제품 추가 실패: " + error.message);
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("제품이 업데이트되었습니다");
      utils.products.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("제품 업데이트 실패: " + error.message);
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("제품이 삭제되었습니다");
      utils.products.listAll.invalidate();
    },
    onError: (error) => {
      toast.error("제품 삭제 실패: " + error.message);
    },
  });

  const toggleActive = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.listAll.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      affiliateUrl: "",
      price: "",
      sortOrder: 0,
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl,
      affiliateUrl: product.affiliateUrl,
      price: product.price || "",
      sortOrder: product.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 이 제품을 삭제하시겠습니까?")) {
      deleteProduct.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">제품 관리</h1>
          <p className="text-muted-foreground mt-1">제휴 제품 갤러리를 관리합니다</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              제품 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "제품 수정" : "새 제품 추가"}</DialogTitle>
              <DialogDescription>
                제품 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">제품명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">이미지 URL *</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview"
                        className="w-full h-48 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliateUrl">제휴 링크 URL (쿠팡파트너스) *</Label>
                  <Input
                    id="affiliateUrl"
                    type="url"
                    value={formData.affiliateUrl}
                    onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">가격</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="예: 29,900원"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">정렬 순서</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  취소
                </Button>
                <Button type="submit">
                  {editingProduct ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              아직 제품이 없습니다. 첫 제품을 추가해보세요!
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base line-clamp-2">
                  {product.name}
                </CardTitle>
                {product.price && (
                  <CardDescription className="text-primary font-semibold">
                    {product.price}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleActive.mutate({ 
                      id: product.id, 
                      isActive: !product.isActive 
                    })}
                  >
                    {product.isActive ? "비활성화" : "활성화"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

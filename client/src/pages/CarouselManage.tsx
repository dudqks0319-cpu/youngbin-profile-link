import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";

export default function CarouselManage() {
  const { data: images = [] } = trpc.carousel.listAll.useQuery();
  const utils = trpc.useUtils();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    linkUrl: "",
    sortOrder: 0,
  });

  const createImage = trpc.carousel.create.useMutation({
    onSuccess: () => {
      toast.success("이미지가 추가되었습니다");
      utils.carousel.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("이미지 추가 실패: " + error.message);
    },
  });

  const updateImage = trpc.carousel.update.useMutation({
    onSuccess: () => {
      toast.success("이미지가 업데이트되었습니다");
      utils.carousel.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("이미지 업데이트 실패: " + error.message);
    },
  });

  const deleteImage = trpc.carousel.delete.useMutation({
    onSuccess: () => {
      toast.success("이미지가 삭제되었습니다");
      utils.carousel.listAll.invalidate();
    },
    onError: (error) => {
      toast.error("이미지 삭제 실패: " + error.message);
    },
  });

  const toggleActive = trpc.carousel.update.useMutation({
    onSuccess: () => {
      utils.carousel.listAll.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      title: "",
      linkUrl: "",
      sortOrder: 0,
    });
    setEditingImage(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (image: any) => {
    setEditingImage(image);
    setFormData({
      imageUrl: image.imageUrl,
      title: image.title || "",
      linkUrl: image.linkUrl || "",
      sortOrder: image.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingImage) {
      updateImage.mutate({ id: editingImage.id, ...formData });
    } else {
      createImage.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 이 이미지를 삭제하시겠습니까?")) {
      deleteImage.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">캐러셀 관리</h1>
          <p className="text-muted-foreground mt-1">추천 게시물 이미지를 관리합니다</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              이미지 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingImage ? "이미지 수정" : "새 이미지 추가"}</DialogTitle>
              <DialogDescription>
                캐러셀에 표시할 이미지 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
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
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">링크 URL</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
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
                  {editingImage ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              아직 캐러셀 이미지가 없습니다. 첫 이미지를 추가해보세요!
            </CardContent>
          </Card>
        ) : (
          images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={image.imageUrl} 
                  alt={image.title || "Carousel image"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={image.isActive ? "default" : "secondary"}>
                    {image.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base">
                  {image.title || "제목 없음"}
                </CardTitle>
                {image.linkUrl && (
                  <CardDescription className="text-xs truncate">
                    {image.linkUrl}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => toggleActive.mutate({ 
                    id: image.id, 
                    isActive: !image.isActive 
                  })}
                >
                  {image.isActive ? "비활성화" : "활성화"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(image)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

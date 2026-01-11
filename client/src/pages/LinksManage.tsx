import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ExternalLink, Star } from "lucide-react";

export default function LinksManage() {
  const { data: links = [] } = trpc.links.listAll.useQuery();
  const utils = trpc.useUtils();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    isPriority: false,
    sortOrder: 0,
  });

  const createLink = trpc.links.create.useMutation({
    onSuccess: () => {
      toast.success("링크가 추가되었습니다");
      utils.links.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("링크 추가 실패: " + error.message);
    },
  });

  const updateLink = trpc.links.update.useMutation({
    onSuccess: () => {
      toast.success("링크가 업데이트되었습니다");
      utils.links.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error("링크 업데이트 실패: " + error.message);
    },
  });

  const deleteLink = trpc.links.delete.useMutation({
    onSuccess: () => {
      toast.success("링크가 삭제되었습니다");
      utils.links.listAll.invalidate();
    },
    onError: (error) => {
      toast.error("링크 삭제 실패: " + error.message);
    },
  });

  const toggleActive = trpc.links.update.useMutation({
    onSuccess: () => {
      utils.links.listAll.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      isPriority: false,
      sortOrder: 0,
    });
    setEditingLink(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || "",
      isPriority: link.isPriority,
      sortOrder: link.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLink) {
      updateLink.mutate({ id: editingLink.id, ...formData });
    } else {
      createLink.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 이 링크를 삭제하시겠습니까?")) {
      deleteLink.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">링크 관리</h1>
          <p className="text-muted-foreground mt-1">프로필 페이지에 표시될 링크를 관리합니다</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              링크 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? "링크 수정" : "새 링크 추가"}</DialogTitle>
              <DialogDescription>
                링크 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPriority"
                    checked={formData.isPriority}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPriority: checked })}
                  />
                  <Label htmlFor="isPriority">우선순위 링크로 설정</Label>
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
                  {editingLink ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {links.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              아직 링크가 없습니다. 첫 링크를 추가해보세요!
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      {link.isPriority && (
                        <Badge variant="default" className="gap-1">
                          <Star className="w-3 h-3" />
                          우선순위
                        </Badge>
                      )}
                      <Badge variant={link.isActive ? "default" : "secondary"}>
                        {link.isActive ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      {link.url}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive.mutate({ 
                        id: link.id, 
                        isActive: !link.isActive 
                      })}
                    >
                      <Switch checked={link.isActive} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(link)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {link.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

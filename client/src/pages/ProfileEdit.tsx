import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ProfileEdit() {
  const { data: profile, isLoading } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    instagramHandle: "",
    profileImageUrl: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        instagramHandle: profile.instagramHandle || "",
        profileImageUrl: profile.profileImageUrl || "",
      });
    }
  }, [profile]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다");
      utils.profile.get.invalidate();
    },
    onError: (error) => {
      toast.error("프로필 업데이트 실패: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">프로필 편집</h1>
        <p className="text-muted-foreground mt-1">크리에이터 프로필 정보를 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            공개 페이지에 표시될 프로필 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">표시 이름 *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                placeholder="영빈"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram 아이디</Label>
              <Input
                id="instagramHandle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                placeholder="youngbin_official"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="육아용품을 소개하는 크리에이터입니다"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImageUrl">프로필 이미지 URL</Label>
              <Input
                id="profileImageUrl"
                type="url"
                value={formData.profileImageUrl}
                onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                placeholder="https://example.com/profile.jpg"
              />
              {formData.profileImageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.profileImageUrl} 
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2"
                  />
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="w-full"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

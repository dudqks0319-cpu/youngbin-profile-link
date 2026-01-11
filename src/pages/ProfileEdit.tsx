import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ProfileEdit() {
  const { data: profile, isLoading } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState<any>({
    displayName: "",
    bio: "",
    instagramHandle: "",
    profileImageUrl: "",
    backgroundImageUrl: "",
    backgroundColor: "",
    socialLinks: {
      instagram: "",
      youtube: "",
      tiktok: "",
      twitter: "",
      twitch: "",
      discord: "",
      telegram: "",
      email: "",
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        instagramHandle: profile.instagramHandle || "",
        profileImageUrl: profile.profileImageUrl || "",
        backgroundImageUrl: profile.backgroundImageUrl || "",
        backgroundColor: profile.backgroundColor || "",
        socialLinks: (profile.socialLinks as any) || {
          instagram: "",
          youtube: "",
          tiktok: "",
          twitter: "",
          twitch: "",
          discord: "",
          telegram: "",
          email: "",
        },
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="social">소셜 미디어</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>
                  공개 페이지에 표시될 프로필 정보를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="backgroundImageUrl">배경 이미지 URL</Label>
                  <Input
                    id="backgroundImageUrl"
                    type="url"
                    value={formData.backgroundImageUrl}
                    onChange={(e) => setFormData({ ...formData, backgroundImageUrl: e.target.value })}
                    placeholder="https://example.com/background.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">배경 색상</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.backgroundColor || "#ffffff"}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundColor || "#ffffff"}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>소셜 미디어 링크</CardTitle>
                <CardDescription>
                  프로필 하단에 표시될 소셜 미디어 링크를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
                  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
                  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/..." },
                  { key: "twitter", label: "Twitter/X", placeholder: "https://twitter.com/..." },
                  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/..." },
                  { key: "discord", label: "Discord", placeholder: "https://discord.gg/..." },
                  { key: "telegram", label: "Telegram", placeholder: "https://t.me/..." },
                  { key: "email", label: "이메일", placeholder: "example@email.com" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type={key === "email" ? "email" : "url"}
                      value={(formData.socialLinks as any)[key] || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          [key]: e.target.value,
                        },
                      })}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
    </div>
  );
}

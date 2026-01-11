import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ExternalLink, Mail, Instagram, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [email, setEmail] = useState("");
  
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: links = [] } = trpc.links.list.useQuery();
  const { data: carouselImages = [] } = trpc.carousel.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  
  const trackClick = trpc.links.trackClick.useMutation();
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("뉴스레터 구독이 완료되었습니다!");
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLinkClick = (linkId: number, url: string) => {
    trackClick.mutate({
      linkId,
      userAgent: navigator.userAgent,
    });
    window.open(url, "_blank");
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribe.mutate({ email });
    }
  };

  const priorityLinks = links.filter(link => link.isPriority);
  const regularLinks = links.filter(link => !link.isPriority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-2xl py-12 space-y-8">
        {/* Profile Header */}
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            {profile?.profileImageUrl && (
              <div className="flex justify-center">
                <img 
                  src={profile.profileImageUrl} 
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {profile?.displayName || "영빈"}
              </h1>
              {profile?.instagramHandle && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Instagram className="w-4 h-4" />
                  <span>@{profile.instagramHandle}</span>
                </div>
              )}
              {profile?.bio && (
                <p className="text-muted-foreground max-w-md mx-auto">
                  {profile.bio}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Featured Carousel */}
        {carouselImages.length > 0 && (
          <Card className="border-2 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                추천 게시물
              </h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {carouselImages.map((image) => (
                    <CarouselItem key={image.id}>
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={image.imageUrl} 
                          alt={image.title || "Featured"}
                          className="w-full h-full object-cover"
                        />
                        {image.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white font-medium">{image.title}</p>
                          </div>
                        )}
                        {image.linkUrl && (
                          <a 
                            href={image.linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0"
                          >
                            <span className="sr-only">View post</span>
                          </a>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </CardContent>
          </Card>
        )}

        {/* Priority Links */}
        {priorityLinks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground px-2">
              우선 링크
            </h2>
            {priorityLinks.map((link) => (
              <Button
                key={link.id}
                variant="default"
                size="lg"
                className="w-full h-auto py-4 px-6 text-left justify-between shadow-md hover:shadow-lg transition-all"
                onClick={() => handleLinkClick(link.id, link.url)}
              >
                <div className="flex-1">
                  <div className="font-semibold text-base">{link.title}</div>
                  {link.description && (
                    <div className="text-sm opacity-90 mt-1">{link.description}</div>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 ml-4 flex-shrink-0" />
              </Button>
            ))}
          </div>
        )}

        {/* Regular Links */}
        {regularLinks.length > 0 && (
          <div className="space-y-3">
            {priorityLinks.length > 0 && (
              <h2 className="text-lg font-semibold text-foreground px-2">
                일반 링크
              </h2>
            )}
            {regularLinks.map((link) => (
              <Button
                key={link.id}
                variant="outline"
                size="lg"
                className="w-full h-auto py-4 px-6 text-left justify-between bg-card hover:bg-accent/10 shadow-sm hover:shadow-md transition-all"
                onClick={() => handleLinkClick(link.id, link.url)}
              >
                <div className="flex-1">
                  <div className="font-semibold text-base">{link.title}</div>
                  {link.description && (
                    <div className="text-sm text-muted-foreground mt-1">{link.description}</div>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 ml-4 flex-shrink-0" />
              </Button>
            ))}
          </div>
        )}

        {/* Product Gallery */}
        {products.length > 0 && (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">추천 제품</h2>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <a
                    key={product.id}
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        {product.price && (
                          <p className="text-primary font-semibold text-sm">
                            {product.price}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Subscription */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">뉴스레터 구독</h2>
                <p className="text-muted-foreground text-sm">
                  독점 콘텐츠와 최신 소식을 가장 먼저 받아보세요
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={subscribe.isPending}>
                  {subscribe.isPending ? "구독 중..." : "구독"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>© 2025 {profile?.displayName || "영빈"}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

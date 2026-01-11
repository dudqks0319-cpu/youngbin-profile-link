import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ExternalLink, Mail, Instagram, TrendingUp, Youtube, Send, MessageCircle, Twitter, ChevronUp, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// TikTok SVG icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Kakao icon component
const KakaoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.84 1.89 5.33 4.71 6.73-.16.57-.51 2.05-.58 2.37-.09.42.15.41.32.3.13-.09 2.05-1.39 2.88-1.95.85.13 1.74.2 2.67.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
  </svg>
);

// Naver icon component
const NaverIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
  </svg>
);

// Social media icons mapping with better icons
const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  tiktok: TikTokIcon,
  twitch: MessageCircle,
  discord: MessageCircle,
  telegram: Send,
  email: Mail,
  kakao: KakaoIcon,
  naver: NaverIcon,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: "hover:text-pink-500 hover:scale-110",
  youtube: "hover:text-red-500 hover:scale-110",
  twitter: "hover:text-gray-800 dark:hover:text-white hover:scale-110",
  tiktok: "hover:text-black dark:hover:text-white hover:scale-110",
  twitch: "hover:text-purple-500 hover:scale-110",
  discord: "hover:text-indigo-500 hover:scale-110",
  telegram: "hover:text-blue-400 hover:scale-110",
  email: "hover:text-gray-600 hover:scale-110",
  kakao: "hover:text-yellow-500 hover:scale-110",
  naver: "hover:text-green-500 hover:scale-110",
};

// Get time-based greeting
const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "좋은 아침이에요! ☀️";
  if (hour >= 12 && hour < 17) return "좋은 오후에요! 🌤️";
  if (hour >= 17 && hour < 21) return "좋은 저녁이에요! 🌅";
  return "좋은 밤이에요! 🌙";
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const linkButtonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.98 }
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme, toggleTheme, switchable } = useTheme();
  const [greeting] = useState(getTimeGreeting());
  
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: links = [], isLoading: linksLoading } = trpc.links.list.useQuery();
  const { data: carouselImages = [] } = trpc.carousel.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  
  const trackClick = trpc.links.trackClick.useMutation();
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("뉴스레터 구독이 완료되었습니다! 🎉");
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
  const socialLinks = (profile?.socialLinks as any) || {};

  // Skeleton loading component
  const SkeletonCard = () => (
    <Card className="border-2 shadow-lg animate-pulse">
      <CardContent className="pt-8 pb-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-32 mx-auto" />
          <div className="h-4 bg-muted rounded w-48 mx-auto" />
          <div className="h-4 bg-muted rounded w-64 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-primary/5 dark:via-secondary/5 dark:to-accent/5 transition-colors duration-500">
      {/* Dark mode toggle - Fixed position */}
      {switchable && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-md shadow-lg border border-border hover:shadow-xl transition-all"
          aria-label="Toggle dark mode"
        >
          <AnimatePresence mode="wait">
            {theme === "light" ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-5 h-5 text-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-5 h-5 text-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      <motion.div 
        className="container max-w-2xl py-12 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Time-based greeting */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm text-sm font-medium text-muted-foreground shadow-sm">
            {greeting}
          </span>
        </motion.div>

        {/* Profile Header */}
        {profileLoading ? (
          <SkeletonCard />
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="border-2 shadow-lg backdrop-blur-sm bg-card/80 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                {profile?.profileImageUrl && (
                  <motion.div 
                    className="flex justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img 
                      src={profile.profileImageUrl} 
                      alt={profile.displayName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                    />
                  </motion.div>
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
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                  
                  {/* Social Media Icons */}
                  {Object.entries(socialLinks).some(([_, url]) => url) && (
                    <motion.div 
                      className="flex justify-center gap-5 mt-4 pt-4 border-t border-border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {Object.entries(socialLinks).map(([platform, url]) => {
                        if (!url) return null;
                        const Icon = SOCIAL_ICONS[platform] || ExternalLink;
                        const colorClass = SOCIAL_COLORS[platform] || "hover:text-primary hover:scale-110";
                        return (
                          <motion.a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-all duration-200 ${colorClass}`}
                            title={platform}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Icon className="w-5 h-5" />
                          </motion.a>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Featured Carousel */}
        {carouselImages.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-2 shadow-lg overflow-hidden backdrop-blur-sm bg-card/80">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  추천 게시물
                </h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {carouselImages.map((image) => (
                      <CarouselItem key={image.id}>
                        <motion.div 
                          className="relative aspect-video rounded-lg overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
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
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Priority Links */}
        {priorityLinks.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground px-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              우선 링크
            </h2>
            {priorityLinks.map((link, index) => (
              <motion.div
                key={link.id}
                variants={linkButtonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                custom={index}
              >
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-auto py-4 px-6 text-left justify-between shadow-md hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80"
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
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Regular Links */}
        {regularLinks.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-3">
            {priorityLinks.length > 0 && (
              <h2 className="text-lg font-semibold text-foreground px-2">
                일반 링크
              </h2>
            )}
            {regularLinks.map((link, index) => (
              <motion.div
                key={link.id}
                variants={linkButtonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                custom={index}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-auto py-4 px-6 text-left justify-between bg-card/80 backdrop-blur-sm hover:bg-accent/20 shadow-sm hover:shadow-lg transition-all border-2"
                  onClick={() => handleLinkClick(link.id, link.url)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-base">{link.title}</div>
                    {link.description && (
                      <div className="text-sm text-muted-foreground mt-1">{link.description}</div>
                    )}
                  </div>
                  <ExternalLink className="w-5 h-5 ml-4 flex-shrink-0 text-muted-foreground" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Product Gallery */}
        {products.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-2 shadow-lg backdrop-blur-sm bg-card/80">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🛍️ 추천 제품
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {products.map((product) => (
                    <motion.a
                      key={product.id}
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          {product.price && (
                            <p className="text-primary font-bold text-sm">
                              {product.price}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Newsletter Subscription */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/15 to-accent/15 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <motion.div 
                  className="flex justify-center"
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shadow-lg">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                </motion.div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">뉴스레터 구독</h2>
                  <p className="text-muted-foreground text-sm">
                    독점 콘텐츠와 최신 소식을 가장 먼저 받아보세요 ✨
                  </p>
                </div>
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-card/50"
                  />
                  <Button 
                    type="submit" 
                    disabled={subscribe.isPending}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    {subscribe.isPending ? "구독 중..." : "구독"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground py-4"
        >
          <p>© 2025 {profile?.displayName || "영빈"}. All rights reserved.</p>
          <p className="text-xs mt-1 opacity-60">Made with ❤️</p>
        </motion.div>
      </motion.div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

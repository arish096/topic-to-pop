import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, Sparkles, Youtube, Wand2, LogOut, ImageIcon, Zap, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import showcase3 from "@/assets/showcase-3.jpg";

const STYLES = [
  { value: "bold-modern", label: "Bold & Modern" },
  { value: "minimal-clean", label: "Minimal & Clean" },
  { value: "dramatic-cinematic", label: "Dramatic / Cinematic" },
  { value: "fun-playful", label: "Fun & Playful" },
  { value: "tech-futuristic", label: "Tech / Futuristic" },
  { value: "vlog-lifestyle", label: "Vlog / Lifestyle" },
];

const SHOWCASE = [
  { src: showcase1, label: "Challenge / Vlog" },
  { src: showcase2, label: "Tech Review" },
  { src: showcase3, label: "Travel" },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("bold-modern");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const initials = (user?.user_metadata?.display_name || user?.email || "U")
    .toString()
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }
    setLoading(true);
    setImageUrl(null);
    try {
      const styleLabel = STYLES.find((s) => s.value === style)?.label ?? style;
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { topic, context, style: styleLabel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");
      setImageUrl(data.imageUrl);
      toast.success("Thumbnail generated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to generate thumbnail");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToGenerator = () => {
    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="container flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-primary rounded-lg p-1.5 shadow-glow">
              <Youtube className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">ThumbForge</span>
          </div>

          <div className="flex items-center gap-2">
            {authLoading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 hover:bg-card transition-colors pl-1 pr-3 py-1">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
                      {user.user_metadata?.display_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.user_metadata?.display_name || "Creator"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

        <div className="container relative pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-[1.05]">
            Click-worthy thumbnails,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-secondary-foreground bg-primary-foreground border-primary-foreground">in one click.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Describe your video — get a scroll-stopping, HD YouTube thumbnail in seconds. No design skills needed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Button
              size="lg"
              onClick={() => (user ? scrollToGenerator() : navigate("/auth"))}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow h-12 px-8 text-base"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {user ? "Start creating" : "Get started — it's free"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToGenerator}
              className="h-12 px-6 text-base bg-card/40 backdrop-blur"
            >
              See examples
            </Button>
          </div>

          {/* Showcase grid */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {SHOWCASE.map((s, i) => (
                <div
                  key={i}
                  className={`group relative aspect-video overflow-hidden rounded-xl border border-border/60 shadow-card transition-all duration-500 hover:scale-[1.03] hover:shadow-glow ${
                    i === 1 ? "translate-y-0 sm:-translate-y-6" : "translate-y-2 sm:translate-y-2"
                  }`}
                >
                  <img
                    src={s.src}
                    alt={`${s.label} YouTube thumbnail example`}
                    width={1280}
                    height={736}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-xs font-semibold text-white">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12 md:py-16">
        <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Zap, title: "Lightning fast", desc: "Generate in under 10 seconds." },
            { icon: Palette, title: "6 visual styles", desc: "From cinematic to playful — match your brand." },
            { icon: ImageIcon, title: "HD ready", desc: "1280×720 PNG, perfect for YouTube." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:border-primary/30 transition-colors"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Generator */}
      <section id="generator" className="container pb-24 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Create your thumbnail</h2>
          <p className="text-muted-foreground">Tell us about your video and let the AI do the rest.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 max-w-6xl mx-auto">
          {/* Form */}
          <Card className="lg:col-span-2 p-6 md:p-7 bg-card/60 border-border/60 backdrop-blur">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="topic">Video topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g. I survived 24h in Tokyo"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Context / details</Label>
                <Textarea
                  id="context"
                  placeholder="Key moments, mood, subjects, colors, text you want on the thumbnail..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={5}
                  maxLength={600}
                />
                <p className="text-xs text-muted-foreground text-right">{context.length}/600</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Visual style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || (user ? !topic.trim() : false)}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : !user ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Sign in to generate
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate thumbnail
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card className="p-4 md:p-6 bg-card/60 border-border/60 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Preview</h3>
                {imageUrl && (
                  <Button onClick={handleDownload} variant="secondary" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary/40">
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                      <div className="relative bg-gradient-primary rounded-full p-4 shadow-glow">
                        <Sparkles className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Crafting your thumbnail...</p>
                  </div>
                )}

                {!loading && imageUrl && (
                  <img src={imageUrl} alt="Generated YouTube thumbnail" className="h-full w-full object-cover" />
                )}

                {!loading && !imageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                    <div className="bg-secondary rounded-full p-4">
                      <Youtube className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Your thumbnail will appear here</p>
                      <p className="text-sm text-muted-foreground mt-1">Fill in the form and hit generate.</p>
                    </div>
                  </div>
                )}
              </div>

              {imageUrl && (
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="font-semibold text-foreground">1280×720</p>
                    <p>HD resolution</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="font-semibold text-foreground">16:9</p>
                    <p>Aspect ratio</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="font-semibold text-foreground">PNG</p>
                    <p>YouTube-ready</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          ThumbForge · Not affiliated with YouTube · Built with Lovable
        </div>
      </footer>
    </div>
  );
};

export default Index;

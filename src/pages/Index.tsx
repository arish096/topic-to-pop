import { useState } from "react";
import { Loader2, Download, Sparkles, Youtube, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STYLES = [
  { value: "bold-modern", label: "Bold & Modern" },
  { value: "minimal-clean", label: "Minimal & Clean" },
  { value: "dramatic-cinematic", label: "Dramatic / Cinematic" },
  { value: "fun-playful", label: "Fun & Playful" },
  { value: "tech-futuristic", label: "Tech / Futuristic" },
  { value: "vlog-lifestyle", label: "Vlog / Lifestyle" },
];

const Index = () => {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("bold-modern");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-primary rounded-lg p-1.5 shadow-glow">
              <Youtube className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">ThumbForge</span>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered thumbnails
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-hero">
        <div className="container py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            YouTube Thumbnails,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">generated in seconds.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Describe your video and get a click-worthy, scroll-stopping thumbnail — no design skills required.
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="container pb-24">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <Card className="lg:col-span-2 p-6 md:p-8 bg-card/60 border-border/60 backdrop-blur">
            <h2 className="text-xl font-bold mb-1">Create your thumbnail</h2>
            <p className="text-sm text-muted-foreground mb-6">Tell us about your video.</p>

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
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
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
                <h2 className="text-xl font-bold">Preview</h2>
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
                  <img
                    src={imageUrl}
                    alt="Generated YouTube thumbnail"
                    className="h-full w-full object-cover"
                  />
                )}

                {!loading && !imageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                    <div className="bg-secondary rounded-full p-4">
                      <Youtube className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Your thumbnail will appear here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fill in the form and hit generate.
                      </p>
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

      <footer className="border-t border-border/50 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          ThumbForge · Not affiliated with YouTube · Built with Lovable
        </div>
      </footer>
    </div>
  );
};

export default Index;

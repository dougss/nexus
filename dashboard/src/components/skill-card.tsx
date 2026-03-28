import { useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Skill } from "@/types";

type Props = {
  skill: Skill;
  position: { x: number; y: number };
  onClose: () => void;
};

export function SkillCard({ skill, position, onClose }: Props) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // Adjust position so card stays within viewport
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const pad = 16;

    let x = position.x + 12;
    let y = position.y - rect.height / 2;

    // Right overflow
    if (x + rect.width + pad > window.innerWidth) {
      x = position.x - rect.width - 12;
    }
    // Bottom overflow
    if (y + rect.height + pad > window.innerHeight) {
      y = window.innerHeight - rect.height - pad;
    }
    // Top overflow
    if (y < pad) {
      y = pad;
    }

    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.style.opacity = "1";
  }, [position]);

  return (
    <div
      ref={cardRef}
      className="fixed z-50 w-[380px] max-w-[380px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40 opacity-0 transition-opacity duration-150"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {skill.displayName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {skill.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-2">
        {skill.category && (
          <Badge variant="secondary" className="text-xs">
            {skill.category}
          </Badge>
        )}
        {(skill.tags ?? []).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <Separator className="mt-3" />

      {/* Content preview */}
      <ScrollArea className="h-[200px] px-4 py-3">
        <div className="overflow-hidden w-full">
          <article className="prose prose-invert prose-xs max-w-none break-words overflow-hidden prose-headings:text-foreground prose-headings:font-semibold prose-headings:text-xs prose-p:text-muted-foreground prose-p:text-xs prose-strong:text-foreground prose-code:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:text-xs prose-pre:overflow-x-auto prose-pre:max-w-full prose-li:text-muted-foreground prose-li:text-xs prose-a:text-primary prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-hr:border-border">
            <ReactMarkdown>{skill.content}</ReactMarkdown>
          </article>
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => navigate(`/skills/${skill.name}`)}
        >
          Open
          <ExternalLink className="ml-1 size-3" />
        </Button>
      </div>
    </div>
  );
}

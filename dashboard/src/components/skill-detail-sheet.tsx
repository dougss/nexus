import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Skill } from "@/types";

type Props = {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SkillDetailSheet({ skill, open, onOpenChange }: Props) {
  if (!skill) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="font-sans">{skill.displayName}</SheetTitle>
          <SheetDescription>{skill.description}</SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Category
            </p>
            <Badge variant="secondary">{skill.category ?? "—"}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Tags
            </p>
            <div className="flex flex-wrap gap-1">
              {(skill.tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {(!skill.tags || skill.tags.length === 0) && (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>
          {skill.model && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Model
              </p>
              <code className="font-mono text-sm">{skill.model}</code>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Content
            </p>
            <ScrollArea className="h-[300px] rounded-md border p-3">
              <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                {skill.content}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

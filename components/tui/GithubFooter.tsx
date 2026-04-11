import { cn } from "@/lib/utils";

interface GithubFooterProps {
  className?: string;
}

export default function GithubFooter({ className }: GithubFooterProps) {
  return (
    <div className={cn("text-center text-xs text-muted-foreground font-mono py-4", className)}>
      <span className="text-primary/60">&gt;</span>{" "}
      <a
        href="https://github.com/Ryun1/cardano-treasury-donator"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary transition-colors underline underline-offset-4"
      >
        github.com/Ryun1/cardano-treasury-donator
      </a>
    </div>
  );
}

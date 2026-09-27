import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
};

/** Label + underline input + optional hint/error line. */
export function Field({ id, label, hint, error, ...input }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="font-mono text-[11px] uppercase tracking-meta text-accent">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-fg-dim">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="border border-accent/50 px-4 py-3 font-mono text-[11px] uppercase tracking-meta text-accent"
    >
      {children}
    </p>
  );
}

export function FormNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-rule px-4 py-3 text-[13px] leading-[1.6] text-fg/[0.8]">
      {children}
    </p>
  );
}

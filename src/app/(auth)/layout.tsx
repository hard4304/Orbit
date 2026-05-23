import { ReactNode } from "react";
import { OrbitLogo } from "@/components/ui/orbit-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <OrbitLogo size={48} />
          <h1 className="text-3xl font-bold text-primary font-heading">orbit</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your life, beautifully.</p>
        </div>
        {children}
      </div>
    </div>
  );
}

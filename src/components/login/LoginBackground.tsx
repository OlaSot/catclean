import type { ReactNode } from "react";
import { LOGIN_PAGE_BG_CLASS } from "./login-styles";

type LoginBackgroundProps = {
  children: ReactNode;
};

export function LoginBackground({ children }: LoginBackgroundProps) {
  return (
    <main className={LOGIN_PAGE_BG_CLASS}>
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-[20%] -top-[15%] h-[min(720px,80vw)] w-[min(720px,80vw)] rounded-full bg-[radial-gradient(circle,rgba(52,89,126,0.10),transparent_68%)]" />
        <div className="absolute -bottom-[18%] -right-[12%] h-[min(640px,75vw)] w-[min(640px,75vw)] rounded-full bg-[radial-gradient(circle,rgba(52,89,126,0.07),transparent_70%)]" />
        <div className="absolute left-1/2 top-1/3 h-[min(480px,60vw)] w-[min(480px,60vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,217,235,0.35),transparent_72%)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </main>
  );
}

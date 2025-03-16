/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@radix-ui/react-hover-card' {
  import type { ReactNode, ElementType } from 'react';
  
  interface HoverCardProps {
    children: ReactNode;
  }
  
  interface HoverCardTriggerProps {
    asChild?: boolean;
    children: ReactNode;
  }
  
  interface HoverCardContentProps {
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
    children: ReactNode;
  }
  
  export const Root: ElementType<HoverCardProps>;
  export const Trigger: ElementType<HoverCardTriggerProps>;
  export const Content: ElementType<HoverCardContentProps>;
}
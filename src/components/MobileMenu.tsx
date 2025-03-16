"use client";

import * as React from 'react';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    currentPath?: string;
  }
}

const MobileMenu: React.FC = () => {
  const [currentPath, setCurrentPath] = React.useState('/');

  // Get the current path from window when component mounts
  React.useEffect(() => {
    if (window.currentPath) {
      setCurrentPath(window.currentPath);
    }
  }, []);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex items-center justify-center md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] sm:w-[300px] dark:bg-gray-900 dark:border-gray-800">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Main navigation links for Tank'd Planner</SheetDescription>
        <nav className="grid gap-4 py-6" aria-label="Main Navigation">
          <a 
            href="/" 
            className={cn(
              "flex items-center gap-2 py-2 text-sm font-medium",
              isActive('/') 
                ? "text-primary" 
                : "hover:text-primary dark:text-gray-200"
            )}
          >
            Home
          </a>
          <a 
            href="/planner" 
            className={cn(
              "flex items-center gap-2 py-2 text-sm font-medium",
              isActive('/planner') 
                ? "text-primary" 
                : "hover:text-primary dark:text-gray-200"
            )}
          >
            Tank Planner
          </a>
          <a 
            href="/fish-guide" 
            className={cn(
              "flex items-center gap-2 py-2 text-sm font-medium",
              isActive('/fish-guide') 
                ? "text-primary" 
                : "hover:text-primary dark:text-gray-200"
            )}
          >
            Fish Guide
          </a>
          <a 
            href="/plants" 
            className={cn(
              "flex items-center gap-2 py-2 text-sm font-medium",
              isActive('/plants') 
                ? "text-primary" 
                : "hover:text-primary dark:text-gray-200"
            )}
          >
            Plants
          </a>
          <a 
            href="/about" 
            className={cn(
              "flex items-center gap-2 py-2 text-sm font-medium",
              isActive('/about') 
                ? "text-primary" 
                : "hover:text-primary dark:text-gray-200"
            )}
          >
            About
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

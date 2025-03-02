/// <reference types="astro/client" />

// Declare the astro:content module
declare module 'astro:content' {
    interface DefineCollection {
      schema?: any;
    }
  
    export function defineCollection(config: DefineCollection): any;
    export function getCollection(collection: string, filter?: (entry: any) => boolean): Promise<any[]>;
    export function getEntry(collection: string, slug: string): Promise<any>;
    
    export const z: any;
  }
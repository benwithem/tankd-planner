// src/content/config.ts
import { defineCollection, z } from 'astro:content';

export const collections = {
  'fish': defineCollection({
    schema: z.object({
      commonName: z.string(),
      scientificName: z.string(),
      careLevel: z.enum(['beginner', 'intermediate', 'advanced']),
      temperament: z.enum(['peaceful', 'semi-aggressive', 'aggressive']),
      tankSize: z.object({
        minimum: z.number(),
        recommended: z.number()
      }),
      waterParameters: z.object({
        temperature: z.tuple([z.number(), z.number()]),
        pH: z.tuple([z.number(), z.number()]),
        hardness: z.tuple([z.number(), z.number()]).optional()
      }),
      compatibility: z.object({
        peaceful: z.boolean().or(z.enum(['caution'])),
        aggressive: z.boolean().or(z.enum(['caution'])),
        shrimp: z.boolean().or(z.enum(['caution'])),
        plants: z.boolean()
      }),
      image: z.string().optional(),
      thumbnail: z.string().optional()
    })
  })
};
import { defineCollection, z } from 'astro:content';

const tankCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    profile: z.string(),
    lengthInches: z.number(),
    widthInches: z.number(),
    heightInches: z.number(),
    glassThicknessMM: z.number(),
    volumeGallons: z.number(),
  }),
});

export const collections = {
  fish: defineCollection({ type: 'content' }),
  tanks: tankCollection,
};
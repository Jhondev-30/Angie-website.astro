import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    longDescription: z.string(),
    bestFor: z.array(z.string()),
    format: z.string().optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    url:z.string()
  }),
});

export const collections = { services };

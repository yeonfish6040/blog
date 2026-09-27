import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { siteConfig } from '../config'
import { postLocaleLoader } from './post-locale-loader.mjs'

const postsCollection = defineCollection({
  loader: postLocaleLoader(siteConfig.lang),
  schema: z.object({
    title: z.string(),
    published: z.date(),
    updated: z.date().optional(),
    draft: z.boolean().optional().default(false),
    description: z.string().optional().default(''),
    image: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().default(''),
    lang: z.string().optional().default(''),
    locales: z.record(z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })).optional().default({}),
    locale: z.string(),
    sourceLocale: z.string(),
    availableLocales: z.array(z.string()),
    slug: z.string(),
    sourceId: z.string(),

    /* For internal use */
    prevTitle: z.string().default(''),
    prevSlug: z.string().default(''),
    nextTitle: z.string().default(''),
    nextSlug: z.string().default(''),
  }),
})
const specCollection = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/spec' }) })

export const collections: { posts: typeof postsCollection; spec: typeof specCollection } = {
  posts: postsCollection,
  spec: specCollection,
}

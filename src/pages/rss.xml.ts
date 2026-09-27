import { siteConfig } from '@/config'
import rss from '@astrojs/rss'
import { getSortedPosts } from '@utils/content-utils'
import type { APIContext } from 'astro'
import sanitizeHtml from 'sanitize-html'

export async function GET(context: APIContext) {
  const blog = await getSortedPosts()

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site: context.site ?? 'https://fuwari.vercel.app',
    items: blog.map(post => {
      return {
        title: post.data.title,
        pubDate: post.data.published,
        description: post.data.description || '',
        link: `/posts/${post.data.slug}/`,
        content: sanitizeHtml(post.rendered?.html ?? '', {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }),
      }
    }),
    customData: `<language>${siteConfig.lang}</language>`,
  })
}

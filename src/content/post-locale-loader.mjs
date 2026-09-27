import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createMarkdownProcessor, parseFrontmatter } from '@astrojs/markdown-remark'

function normalizeLocale(locale) {
  if (typeof locale !== 'string' || !/^[a-z]{2}(?:[-_][a-z]{2})?$/i.test(locale)) {
    throw new Error(`Invalid post locale: ${locale}`)
  }
  return locale.replaceAll('_', '-').toLowerCase()
}

function remarkSelectLocale({ locale, getAvailableLocales }) {
  return tree => {
    function select(nodes) {
      return nodes.flatMap(node => {
        if (node.type === 'containerDirective' && node.name === 'locale') {
          const language = node.attributes?.lang
          if (!language) {
            throw new Error('Every locale block needs a valid lang attribute, such as lang=ko or lang=en')
          }
          const blockLocale = normalizeLocale(language)
          getAvailableLocales().add(blockLocale)
          return blockLocale === locale ? select(node.children) : []
        }
        if (node.children) node.children = select(node.children)
        return [node]
      })
    }
    tree.children = select(tree.children)
  }
}

async function findMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.filter(entry => !entry.name.startsWith('_')).map(async entry => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return findMarkdownFiles(file)
    return entry.isFile() && entry.name.endsWith('.md') ? [file] : []
  }))
  return files.flat()
}

function getSlug(file, postsDirectory, frontmatter) {
  if (frontmatter.slug) return frontmatter.slug.replace(/^\/|\/$/g, '')
  const relativePath = path.relative(postsDirectory, file).replace(/\.md$/, '')
  return relativePath.split(path.sep).map(segment =>
    segment.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replaceAll(' ', '-'),
  ).join('/').replace(/\/index$/, '')
}

export function postLocaleLoader(siteLanguage) {
  return {
    name: 'post-locale-loader',
    async load(context) {
      const { config, parseData, store, watcher } = context
      const postsDirectory = fileURLToPath(new URL('content/posts/', config.srcDir))
      const rootDirectory = fileURLToPath(config.root)
      const processors = new Map()
      let currentAvailableLocales

      async function getProcessor(locale) {
        if (!processors.has(locale)) {
          const remarkPlugins = [
            [remarkSelectLocale, { locale, getAvailableLocales: () => currentAvailableLocales }],
            ...config.markdown.remarkPlugins,
          ]
          processors.set(locale, await createMarkdownProcessor({ ...config.markdown, remarkPlugins }))
        }
        return processors.get(locale)
      }

      async function loadPosts() {
        store.clear()
        const files = await findMarkdownFiles(postsDirectory)
        for (const file of files) {
          const source = await readFile(file, 'utf8')
          const { frontmatter, content } = parseFrontmatter(source)
          const sourceLocale = normalizeLocale(frontmatter.lang || siteLanguage)
          const slug = getSlug(file, postsDirectory, frontmatter)
          const sourceId = path.relative(postsDirectory, file).split(path.sep).join('/')
          const filePath = path.relative(rootDirectory, file).split(path.sep).join('/')
          const availableLocales = new Set([sourceLocale])

          async function renderLocale(locale) {
            currentAvailableLocales = availableLocales
            const processor = await getProcessor(locale)
            return processor.render(content.trim(), {
              frontmatter,
              fileURL: pathToFileURL(file),
            })
          }

          const sourceRender = await renderLocale(sourceLocale)
          for (const locale of availableLocales) {
            const rendered = locale === sourceLocale ? sourceRender : await renderLocale(locale)
            const translatedMetadata = Object.entries(frontmatter.locales || {})
              .find(([key]) => normalizeLocale(key) === locale)?.[1] || {}
            const id = locale === sourceLocale ? slug : `${locale}/${slug}`
            const data = await parseData({
              id,
              filePath: file,
              data: {
                ...frontmatter,
                title: translatedMetadata.title || frontmatter.title,
                description: translatedMetadata.description || frontmatter.description,
                lang: locale,
                locale,
                sourceLocale,
                slug,
                sourceId,
                availableLocales: [...availableLocales],
              },
            })
            store.set({
              id,
              data,
              body: content.trim(),
              filePath,
              rendered: { html: rendered.code, metadata: rendered.metadata },
              assetImports: rendered.metadata.imagePaths,
            })
          }
        }
      }

      await loadPosts()
      if (watcher) {
        watcher.add(postsDirectory)
        let pending = Promise.resolve()
        const reload = file => {
          if (!file.startsWith(postsDirectory) || !file.endsWith('.md')) return
          pending = pending.then(loadPosts)
        }
        watcher.on('add', reload)
        watcher.on('change', reload)
        watcher.on('unlink', reload)
      }
    },
  }
}

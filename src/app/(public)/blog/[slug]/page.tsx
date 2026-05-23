import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'

/**
 * SSG + ISR: страницы генерируются при сборке, обновляются раз в час.
 * Требования: 13.2, 13.4, 16.3, 16.4
 */
export const revalidate = 3600

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

// ─── Типы ────────────────────────────────────────────────────────────────────

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  previewImageUrl: string | null
  previewImageAlt: string | null
  publishedAt: string | null
}

interface BlogPostDetail {
  id: string
  title: string
  slug: string
  excerpt: string | null
  previewImageUrl: string | null
  previewImageAlt: string | null
  content: unknown // richText (Lexical JSON)
  tags: string[]
  publishedAt: string | null
  seo: {
    title?: string | null
    description?: string | null
    ogImageUrl?: string | null
  }
}

// ─── generateStaticParams ─────────────────────────────────────────────────────

/**
 * Генерирует статические параметры для всех опубликованных статей.
 * Требования: 13.2
 */
export async function generateStaticParams() {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'blog',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      select: { slug: true },
    })
    return result.docs.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    return { title: 'Статья не найдена' }
  }

  const seoTitle = post.seo.title ?? `${post.title} — ${BRAND_CONFIG.companyName}`
  const seoDescription = post.seo.description ?? post.excerpt ?? ''
  const canonicalUrl = `${SITE_URL}/blog/${slug}`

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      url: canonicalUrl,
      ...(post.seo.ogImageUrl || post.previewImageUrl
        ? {
            images: [
              {
                url: (post.seo.ogImageUrl ?? post.previewImageUrl)!,
              },
            ],
          }
        : {}),
    },
  }
}

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'blog',
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 1,
      depth: 2,
    })

    if (result.docs.length === 0) return null

    const doc = result.docs[0]!

    // Превью-изображение
    const previewImageUrl =
      doc.previewImage &&
      typeof doc.previewImage === 'object' &&
      'url' in doc.previewImage &&
      typeof doc.previewImage.url === 'string'
        ? doc.previewImage.url
        : null

    const previewImageAlt =
      doc.previewImage &&
      typeof doc.previewImage === 'object' &&
      'alt' in doc.previewImage &&
      typeof doc.previewImage.alt === 'string'
        ? doc.previewImage.alt
        : null

    // Теги
    const tags: string[] = Array.isArray(doc.tags)
      ? doc.tags
          .map((t) =>
            t && typeof t === 'object' && 'tag' in t && typeof t.tag === 'string'
              ? t.tag
              : null,
          )
          .filter((t): t is string => t !== null && t.trim() !== '')
      : []

    // SEO
    const seoGroup = doc.seo as
      | {
          title?: string | null
          description?: string | null
          ogImage?: { url?: string } | null
        }
      | null
      | undefined

    return {
      id: String(doc.id),
      title: String(doc.title ?? ''),
      slug: String(doc.slug ?? ''),
      excerpt: doc.excerpt ?? null,
      previewImageUrl,
      previewImageAlt,
      content: doc.content ?? null,
      tags,
      publishedAt:
        doc.publishedAt && typeof doc.publishedAt === 'string'
          ? doc.publishedAt
          : null,
      seo: {
        title: seoGroup?.title ?? null,
        description: seoGroup?.description ?? null,
        ogImageUrl:
          seoGroup?.ogImage && typeof seoGroup.ogImage === 'object'
            ? (seoGroup.ogImage.url ?? null)
            : null,
      },
    }
  } catch {
    return null
  }
}

/**
 * Загружает 3 связанные статьи по тегам (исключая текущую).
 * Требования: 13.4
 */
async function fetchRelatedPosts(
  currentSlug: string,
  tags: string[],
): Promise<RelatedPost[]> {
  if (tags.length === 0) return []

  try {
    const payload = await getPayload()

    // Ищем статьи с совпадающими тегами
    const result = await payload.find({
      collection: 'blog',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { slug: { not_equals: currentSlug } },
        ],
      },
      limit: 20,
      sort: '-publishedAt',
      depth: 1,
    })

    // Фильтруем по тегам и берём первые 3
    const relatedDocs = result.docs
      .filter((doc) => {
        const docTags: string[] = Array.isArray(doc.tags)
          ? doc.tags
              .map((t) =>
                t && typeof t === 'object' && 'tag' in t && typeof t.tag === 'string'
                  ? t.tag
                  : null,
              )
              .filter((t): t is string => t !== null)
          : []
        return docTags.some((t) => tags.includes(t))
      })
      .slice(0, 3)

    return relatedDocs.map((doc): RelatedPost => {
      const previewImageUrl =
        doc.previewImage &&
        typeof doc.previewImage === 'object' &&
        'url' in doc.previewImage &&
        typeof doc.previewImage.url === 'string'
          ? doc.previewImage.url
          : null

      const previewImageAlt =
        doc.previewImage &&
        typeof doc.previewImage === 'object' &&
        'alt' in doc.previewImage &&
        typeof doc.previewImage.alt === 'string'
          ? doc.previewImage.alt
          : null

      return {
        id: String(doc.id),
        title: doc.title,
        slug: doc.slug,
        excerpt: doc.excerpt ?? null,
        previewImageUrl,
        previewImageAlt,
        publishedAt:
          doc.publishedAt && typeof doc.publishedAt === 'string'
            ? doc.publishedAt
            : null,
      }
    })
  } catch {
    return []
  }
}

// ─── Компоненты ───────────────────────────────────────────────────────────────

/** Рендер richText (Lexical JSON) — упрощённый вариант */
function RichTextRenderer({ content }: { content: unknown }) {
  if (!content) return null

  const text = extractTextFromLexical(content)
  if (!text) return null

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {text.split('\n').map((paragraph, i) =>
        paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
      )}
    </div>
  )
}

/** Рекурсивно извлекает текст из Lexical JSON */
function extractTextFromLexical(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>

  if (typeof n['text'] === 'string') return n['text']

  const children = n['children'] ?? n['root']
  if (Array.isArray(children)) {
    return children
      .map((child) => extractTextFromLexical(child))
      .filter(Boolean)
      .join('\n')
  }
  return ''
}

/** Карточка связанной статьи */
function RelatedPostCard({ post }: { post: RelatedPost }) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      {/* Превью-изображение */}
      <Link
        href={`/blog/${post.slug}`}
        className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="relative aspect-video bg-muted">
          {post.previewImageUrl ? (
            <Image
              src={post.previewImageUrl}
              alt={post.previewImageAlt ?? post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-primary/5"
              aria-hidden="true"
            >
              <span className="text-3xl">📝</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {formattedDate && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            <time dateTime={post.publishedAt ?? undefined}>{formattedDate}</time>
          </div>
        )}

        <h3 className="text-sm font-semibold leading-snug text-foreground">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </div>
    </article>
  )
}

/** Блок «Читайте также» */
function ReadAlsoSection({ posts }: { posts: RelatedPost[] }) {
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="read-also-heading" className="mt-16 border-t border-border pt-12">
      <h2
        id="read-also-heading"
        className="mb-6 text-xl font-semibold text-foreground"
      >
        Читайте также
      </h2>
      <ul
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {posts.map((post) => (
          <li key={post.id}>
            <RelatedPostCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Страница ─────────────────────────────────────────────────────────────────

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Динамическая страница статьи /blog/[slug].
 * Требования: 13.2, 13.4
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // notFound() throws — post is guaranteed non-null here
  const relatedPosts = await fetchRelatedPosts(post.slug, post.tags)

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Хлебные крошки */}
      <nav aria-label="Хлебные крошки" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Блог
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li
            className="max-w-[200px] truncate text-foreground font-medium"
            aria-current="page"
          >
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Кнопка «Назад» */}
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Все статьи
      </Link>

      {/* Заголовок */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      {/* Мета-информация */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <time dateTime={post.publishedAt ?? undefined}>{formattedDate}</time>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Теги статьи">
            <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Краткое описание */}
      {post.excerpt && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      {/* Превью-изображение */}
      {post.previewImageUrl && (
        <div className="mt-8 overflow-hidden rounded-xl">
          <div className="relative aspect-video w-full bg-muted">
            <Image
              src={post.previewImageUrl}
              alt={post.previewImageAlt ?? post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Содержимое статьи */}
      {!!post.content && (
        <section aria-labelledby="article-content-heading" className="mt-10">
          <h2 id="article-content-heading" className="sr-only">
            Содержимое статьи
          </h2>
          <RichTextRenderer content={post.content} />
        </section>
      )}

      {/* Блок «Читайте также» */}
      <ReadAlsoSection posts={relatedPosts} />
    </div>
  )
}

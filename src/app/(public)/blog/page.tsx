import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { CalendarDays, Tag } from 'lucide-react'

/**
 * ISR: страница обновляется не чаще одного раза в 5 минут.
 * Требования: 13.1, 13.5, 16.3, 16.4
 */
export const revalidate = 300

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Блог — ${BRAND_CONFIG.companyName}`,
  description:
    'Статьи и советы по ремонту техники. Полезные материалы о смартфонах, ноутбуках, планшетах и другой электронике.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: `Блог — ${BRAND_CONFIG.companyName}`,
    description:
      'Статьи и советы по ремонту техники. Полезные материалы о смартфонах, ноутбуках, планшетах.',
    type: 'website',
    url: `${SITE_URL}/blog`,
  },
}

// ─── Константы ────────────────────────────────────────────────────────────────

const POSTS_PER_PAGE = 9

// ─── Типы ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  previewImageUrl: string | null
  previewImageAlt: string | null
  publishedAt: string | null
  tags: string[]
}

interface BlogListData {
  posts: BlogPost[]
  totalPages: number
  currentPage: number
  totalDocs: number
}

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchBlogPosts(page: number): Promise<BlogListData> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'blog',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: POSTS_PER_PAGE,
      page,
      sort: '-publishedAt',
      depth: 1,
    })

    const posts: BlogPost[] = result.docs.map((doc): BlogPost => {
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
        tags,
      }
    })

    return {
      posts,
      totalPages: result.totalPages,
      currentPage: result.page ?? page,
      totalDocs: result.totalDocs,
    }
  } catch {
    return {
      posts: [],
      totalPages: 1,
      currentPage: 1,
      totalDocs: 0,
    }
  }
}

// ─── Компоненты ───────────────────────────────────────────────────────────────

function BlogPostCard({ post }: { post: BlogPost }) {
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
              <span className="text-4xl">📝</span>
            </div>
          )}
        </div>
      </Link>

      {/* Контент карточки */}
      <div className="flex flex-1 flex-col p-5">
        {/* Дата */}
        {formattedDate && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={post.publishedAt ?? undefined}>{formattedDate}</time>
          </div>
        )}

        {/* Заголовок */}
        <h2 className="text-base font-semibold leading-snug text-foreground">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {post.title}
          </Link>
        </h2>

        {/* Краткое описание */}
        {post.excerpt && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Теги */}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Теги статьи">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ссылка «Читать далее» */}
        <div className="mt-4">
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label={`Читать статью «${post.title}»`}
          >
            Читать далее →
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Пагинация */
function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Пагинация блога"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {/* Кнопка «Назад» */}
      {currentPage > 1 ? (
        <Link
          href={currentPage === 2 ? '/blog' : `/blog?page=${currentPage - 1}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Предыдущая страница"
        >
          ← Назад
        </Link>
      ) : (
        <span
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-muted-foreground cursor-not-allowed"
          aria-disabled="true"
        >
          ← Назад
        </span>
      )}

      {/* Номера страниц */}
      <div className="flex items-center gap-1" role="list">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage
          return (
            <div key={page} role="listitem">
              {isActive ? (
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                  aria-current="page"
                  aria-label={`Страница ${page}, текущая`}
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={page === 1 ? '/blog' : `/blog?page=${page}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Страница ${page}`}
                >
                  {page}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Кнопка «Вперёд» */}
      {currentPage < totalPages ? (
        <Link
          href={`/blog?page=${currentPage + 1}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Следующая страница"
        >
          Вперёд →
        </Link>
      ) : (
        <span
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-muted-foreground cursor-not-allowed"
          aria-disabled="true"
        >
          Вперёд →
        </span>
      )}
    </nav>
  )
}

// ─── Страница ─────────────────────────────────────────────────────────────────

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>
}

/**
 * Страница /blog — список опубликованных статей с пагинацией (9 на странице).
 * Требования: 13.1, 13.5
 */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const { posts, totalPages, totalDocs } = await fetchBlogPosts(currentPage)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Заголовок страницы */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Блог
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Статьи и советы по ремонту техники
        </p>
        {totalDocs > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalDocs} {pluralizeArticles(totalDocs)}
          </p>
        )}
      </div>

      {/* Список статей */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 px-6 py-20 text-center">
          <p className="text-lg text-muted-foreground">
            Статьи пока не опубликованы. Заходите позже!
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Вернуться на главную
          </Link>
        </div>
      ) : (
        <>
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Список статей блога"
          >
            {posts.map((post) => (
              <li key={post.id}>
                <BlogPostCard post={post} />
              </li>
            ))}
          </ul>

          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  )
}

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function pluralizeArticles(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return 'статей'
  if (mod10 === 1) return 'статья'
  if (mod10 >= 2 && mod10 <= 4) return 'статьи'
  return 'статей'
}

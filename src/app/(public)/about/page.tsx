import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

/**
 * ISR: страница обновляется не чаще одного раза в час.
 * Требования: 10.1, 10.2, 10.3, 16.3, 16.4
 */
export const revalidate = 3600

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `О нас — ${BRAND_CONFIG.companyName}`,
  description:
    'История компании, наша миссия, команда специалистов и ключевые показатели. Узнайте больше о сервисном центре.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: `О нас — ${BRAND_CONFIG.companyName}`,
    description:
      'История компании, наша миссия, команда специалистов и ключевые показатели.',
    type: 'website',
    url: `${SITE_URL}/about`,
  },
}

// ─── Типы ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string
  name: string
  position: string
  photoUrl: string | null
  photoAlt: string | null
}

// ─── Статические данные команды (показываются, если CMS пуст) ────────────────

const STATIC_TEAM: TeamMember[] = [
  { id: 's1', name: 'Алексей Кириллов', position: 'Основатель и руководитель', photoUrl: null, photoAlt: null },
  { id: 's2', name: 'Мария Соколова', position: 'Старший инженер по ремонту', photoUrl: null, photoAlt: null },
  { id: 's3', name: 'Дмитрий Петров', position: 'Специалист по ноутбукам', photoUrl: null, photoAlt: null },
  { id: 's4', name: 'Ольга Иванова', position: 'Менеджер по работе с клиентами', photoUrl: null, photoAlt: null },
  { id: 's5', name: 'Сергей Волков', position: 'Инженер по мобильным устройствам', photoUrl: null, photoAlt: null },
  { id: 's6', name: 'Наталья Козлова', position: 'Специалист по диагностике', photoUrl: null, photoAlt: null },
]

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'team-members',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 50,
      sort: 'sortOrder',
      depth: 1,
    })

    if (result.docs.length === 0) return STATIC_TEAM

    return result.docs.map((member): TeamMember => {
      const photoUrl =
        member.photo &&
        typeof member.photo === 'object' &&
        'url' in member.photo &&
        typeof member.photo.url === 'string'
          ? member.photo.url
          : null

      const photoAlt =
        member.photo &&
        typeof member.photo === 'object' &&
        'alt' in member.photo &&
        typeof member.photo.alt === 'string'
          ? member.photo.alt
          : null

      return {
        id: String(member.id),
        name: member.name,
        position: member.position,
        photoUrl,
        photoAlt,
      }
    })
  } catch {
    return STATIC_TEAM
  }
}

// ─── Компоненты ───────────────────────────────────────────────────────────────

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Фото сотрудника */}
      <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted ring-2 ring-border sm:h-40 sm:w-40">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.photoAlt ?? member.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, 160px"
          />
        ) : (
          /* Заглушка-аватар */
          <div
            className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary"
            aria-hidden="true"
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Имя и должность */}
      <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{member.position}</p>
    </div>
  )
}

// ─── Страница ─────────────────────────────────────────────────────────────────

/**
 * Страница /about — информация о компании.
 *
 * Секции: история, миссия, команда, сертификаты, ключевые показатели.
 * Требования: 10.1, 10.2, 10.3
 */
export default async function AboutPage() {
  const teamMembers = await fetchTeamMembers()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* ── Заголовок страницы ─────────────────────────────────────────── */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          О нас
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Мы — команда профессионалов, которая заботится о вашей технике
        </p>
      </div>

      {/* ── История компании ───────────────────────────────────────────── */}
      <section
        aria-labelledby="history-heading"
        className="mb-20 grid gap-10 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <h2
            id="history-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            История компании
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              {BRAND_CONFIG.companyName} основан командой опытных инженеров,
              объединённых общей целью — предоставлять качественный и честный
              сервис по ремонту электроники.
            </p>
            <p>
              За годы работы мы накопили обширную экспертизу в ремонте
              смартфонов, ноутбуков, планшетов и другой бытовой техники.
              Каждый специалист нашей команды регулярно проходит обучение и
              сертификацию.
            </p>
            <p>
              Мы гордимся тем, что большинство наших клиентов возвращаются
              снова и рекомендуют нас своим близким — это лучшая оценка
              нашей работы.
            </p>
          </div>
        </div>

        {/* Декоративный блок с акцентом */}
        <div className="rounded-2xl bg-primary/5 p-8 ring-1 ring-primary/10">
          <blockquote className="text-lg font-medium italic text-foreground">
            «Мы относимся к каждому устройству так, как будто оно наше
            собственное — с вниманием, аккуратностью и профессионализмом.»
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">
            — Основатель {BRAND_CONFIG.companyName}
          </p>
        </div>
      </section>

      {/* ── Миссия ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="mission-heading"
        className="mb-20 rounded-2xl bg-muted/40 px-8 py-12 text-center ring-1 ring-border"
      >
        <h2
          id="mission-heading"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Наша миссия
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
          Делать качественный ремонт техники доступным для каждого. Мы верим,
          что честность, прозрачность и профессионализм — основа долгосрочных
          отношений с клиентами. Наша цель — не просто починить устройство, а
          вернуть вам уверенность в его надёжности.
        </p>
      </section>

      {/* ── Ключевые показатели ────────────────────────────────────────── */}
      <section
        aria-labelledby="stats-heading"
        className="mb-20"
      >
        <h2
          id="stats-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Цифры говорят сами за себя
        </h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Лет работы */}
          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
            <span className="text-5xl font-extrabold text-primary sm:text-6xl">
              <AnimatedCounter target={10} suffix="+" />
            </span>
            <span className="mt-3 text-base font-medium text-foreground">
              лет на рынке
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Надёжный опыт и экспертиза
            </span>
          </div>

          {/* Выполненных ремонтов */}
          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
            <span className="text-5xl font-extrabold text-primary sm:text-6xl">
              <AnimatedCounter target={15000} suffix="+" />
            </span>
            <span className="mt-3 text-base font-medium text-foreground">
              ремонтов выполнено
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Каждое устройство в надёжных руках
            </span>
          </div>

          {/* Довольных клиентов */}
          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
            <span className="text-5xl font-extrabold text-primary sm:text-6xl">
              <AnimatedCounter target={12000} suffix="+" />
            </span>
            <span className="mt-3 text-base font-medium text-foreground">
              довольных клиентов
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Рекомендуют нас друзьям и близким
            </span>
          </div>
        </div>
      </section>

      {/* ── Команда ────────────────────────────────────────────────────── */}
      <section aria-labelledby="team-heading" className="mb-20">
        <h2
          id="team-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Наша команда
        </h2>

        {teamMembers.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
            <p className="text-muted-foreground">
              Информация о команде скоро появится.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </section>

      {/* ── Сертификаты и награды ──────────────────────────────────────── */}
      <section aria-labelledby="certificates-heading" className="mb-12">
        <h2
          id="certificates-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Сертификаты и награды
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Карточки сертификатов — статический контент, управляется через CMS */}
          {[
            {
              title: 'Авторизованный сервисный центр',
              description:
                'Официальная авторизация от ведущих производителей электроники',
              icon: '🏆',
            },
            {
              title: 'ISO 9001:2015',
              description:
                'Сертификат системы менеджмента качества международного стандарта',
              icon: '📋',
            },
            {
              title: 'Лучший сервис года',
              description:
                'Награда по результатам независимого рейтинга сервисных центров',
              icon: '⭐',
            },
          ].map((cert) => (
            <div
              key={cert.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="text-3xl" aria-hidden="true">
                {cert.icon}
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{cert.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

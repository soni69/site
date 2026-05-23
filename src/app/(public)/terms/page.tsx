import type { Metadata } from 'next'
import { BRAND_CONFIG } from '@/config/brand'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Пользовательское соглашение — ${BRAND_CONFIG.companyName}`,
  description: 'Условия использования сайта и предоставления услуг по ремонту техники.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

export default function TermsPage() {
  const year = new Date().getFullYear()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Пользовательское соглашение
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Последнее обновление: 1 января {year} года
      </p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">

        <section aria-labelledby="acceptance">
          <h2 id="acceptance" className="text-xl font-semibold text-foreground">
            1. Принятие условий
          </h2>
          <p className="mt-3">
            Используя сайт <strong>{SITE_URL}</strong> (далее — «Сайт»), принадлежащий{' '}
            <strong>{BRAND_CONFIG.companyName}</strong> (далее — «Компания»), вы соглашаетесь с
            настоящим Пользовательским соглашением. Если вы не принимаете эти условия,
            пожалуйста, прекратите использование Сайта.
          </p>
        </section>

        <section aria-labelledby="services">
          <h2 id="services" className="text-xl font-semibold text-foreground">
            2. Описание услуг
          </h2>
          <p className="mt-3">
            Сайт предоставляет информацию об услугах по ремонту электроники, позволяет оставить
            заявку на ремонт и ознакомиться с ценами. Фактические услуги по ремонту оказываются
            в сервисном центре {BRAND_CONFIG.companyName} в соответствии с отдельным договором.
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>Ремонт смартфонов и мобильных телефонов</li>
            <li>Ремонт ноутбуков и компьютеров</li>
            <li>Ремонт планшетов</li>
            <li>Диагностика электроники</li>
            <li>Замена комплектующих и аксессуаров</li>
          </ul>
        </section>

        <section aria-labelledby="obligations">
          <h2 id="obligations" className="text-xl font-semibold text-foreground">
            3. Обязательства пользователя
          </h2>
          <p className="mt-3">Пользователь обязуется:</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>Предоставлять достоверные данные при заполнении форм на Сайте</li>
            <li>Не использовать Сайт в незаконных целях</li>
            <li>Не предпринимать попыток взлома, DDoS-атак или иного нарушения работы Сайта</li>
            <li>Соблюдать права интеллектуальной собственности Компании</li>
          </ul>
        </section>

        <section aria-labelledby="liability">
          <h2 id="liability" className="text-xl font-semibold text-foreground">
            4. Ограничение ответственности
          </h2>
          <p className="mt-3">
            Компания не несёт ответственности за прямой или косвенный ущерб, возникший вследствие
            использования или невозможности использования Сайта. Информация на Сайте носит
            ознакомительный характер; точные цены и сроки ремонта согласовываются индивидуально.
          </p>
          <p className="mt-3">
            Компания не гарантирует бесперебойную работу Сайта и вправе приостанавливать его
            работу для технического обслуживания.
          </p>
        </section>

        <section aria-labelledby="ip">
          <h2 id="ip" className="text-xl font-semibold text-foreground">
            5. Интеллектуальная собственность
          </h2>
          <p className="mt-3">
            Все материалы Сайта (тексты, изображения, логотипы, дизайн) являются собственностью
            {BRAND_CONFIG.companyName} и защищены законодательством об авторском праве.
            Воспроизведение без письменного разрешения запрещено.
          </p>
        </section>

        <section aria-labelledby="privacy-ref">
          <h2 id="privacy-ref" className="text-xl font-semibold text-foreground">
            6. Персональные данные
          </h2>
          <p className="mt-3">
            Обработка персональных данных осуществляется в соответствии с{' '}
            <a href="/privacy" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              Политикой конфиденциальности
            </a>
            , являющейся неотъемлемой частью настоящего соглашения.
          </p>
        </section>

        <section aria-labelledby="changes">
          <h2 id="changes" className="text-xl font-semibold text-foreground">
            7. Изменение условий
          </h2>
          <p className="mt-3">
            Компания вправе изменять настоящее соглашение в любое время. Актуальная версия
            всегда доступна по адресу <strong>{SITE_URL}/terms</strong>. Продолжение использования
            Сайта после изменений означает принятие новых условий.
          </p>
        </section>

        <section aria-labelledby="law">
          <h2 id="law" className="text-xl font-semibold text-foreground">
            8. Применимое право
          </h2>
          <p className="mt-3">
            Настоящее соглашение регулируется законодательством Российской Федерации.
            Все споры подлежат рассмотрению в суде по месту нахождения Компании.
          </p>
        </section>

        <section aria-labelledby="contact-terms">
          <h2 id="contact-terms" className="text-xl font-semibold text-foreground">
            9. Контакты
          </h2>
          <address className="mt-3 not-italic space-y-1 text-sm">
            <p><strong>{BRAND_CONFIG.companyName}</strong></p>
            {BRAND_CONFIG.addresses[0] && <p>{BRAND_CONFIG.addresses[0].address}</p>}
            <p>
              Email:{' '}
              <a href={`mailto:${BRAND_CONFIG.email}`} className="text-primary hover:underline">
                {BRAND_CONFIG.email}
              </a>
            </p>
          </address>
        </section>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { BRAND_CONFIG } from '@/config/brand'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${BRAND_CONFIG.companyName}`,
  description: 'Политика конфиденциальности и обработки персональных данных.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

export default function PrivacyPage() {
  const year = new Date().getFullYear()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Политика конфиденциальности
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Последнее обновление: 1 января {year} года
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

        <section aria-labelledby="general">
          <h2 id="general" className="text-xl font-semibold text-foreground">
            1. Общие положения
          </h2>
          <p className="mt-3">
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных,
            которые {BRAND_CONFIG.companyName} (далее — «Компания») получает от пользователей сайта{' '}
            <strong>{SITE_URL}</strong> (далее — «Сайт»).
          </p>
          <p className="mt-3">
            Используя Сайт, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны,
            пожалуйста, прекратите использование Сайта.
          </p>
        </section>

        <section aria-labelledby="data-collected">
          <h2 id="data-collected" className="text-xl font-semibold text-foreground">
            2. Какие данные мы собираем
          </h2>
          <p className="mt-3">Мы можем собирать следующие категории персональных данных:</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>Имя и фамилия</li>
            <li>Номер телефона</li>
            <li>Адрес электронной почты</li>
            <li>Описание неисправности устройства</li>
            <li>IP-адрес и технические данные браузера (в целях безопасности и аналитики)</li>
          </ul>
        </section>

        <section aria-labelledby="purpose">
          <h2 id="purpose" className="text-xl font-semibold text-foreground">
            3. Цели обработки данных
          </h2>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>Обработка заявок на ремонт и обратная связь с клиентами</li>
            <li>Информирование о статусе ремонта</li>
            <li>Улучшение качества сервиса</li>
            <li>Соблюдение требований законодательства Российской Федерации</li>
          </ul>
        </section>

        <section aria-labelledby="storage">
          <h2 id="storage" className="text-xl font-semibold text-foreground">
            4. Хранение и защита данных
          </h2>
          <p className="mt-3">
            Персональные данные хранятся на защищённых серверах на территории Российской Федерации.
            Мы применяем технические и организационные меры защиты, включая шифрование данных при передаче
            (HTTPS) и ограниченный доступ сотрудников к персональным данным.
          </p>
          <p className="mt-3">
            Данные хранятся не дольше, чем это необходимо для достижения целей обработки, но не более
            3 (трёх) лет с момента последнего взаимодействия с клиентом.
          </p>
        </section>

        <section aria-labelledby="third-parties">
          <h2 id="third-parties" className="text-xl font-semibold text-foreground">
            5. Передача данных третьим лицам
          </h2>
          <p className="mt-3">
            Мы не продаём, не передаём и не раскрываем персональные данные третьим лицам без вашего
            согласия, за исключением случаев, предусмотренных действующим законодательством Российской Федерации.
          </p>
        </section>

        <section aria-labelledby="rights">
          <h2 id="rights" className="text-xl font-semibold text-foreground">
            6. Ваши права
          </h2>
          <p className="mt-3">Вы вправе:</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>Запросить доступ к своим персональным данным</li>
            <li>Потребовать исправления неточных данных</li>
            <li>Отозвать согласие на обработку данных</li>
            <li>Потребовать удаления своих данных</li>
          </ul>
          <p className="mt-3">
            Для реализации прав обращайтесь по электронной почте:{' '}
            <a
              href={`mailto:${BRAND_CONFIG.email}`}
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {BRAND_CONFIG.email}
            </a>
          </p>
        </section>

        <section aria-labelledby="cookies">
          <h2 id="cookies" className="text-xl font-semibold text-foreground">
            7. Файлы cookie
          </h2>
          <p className="mt-3">
            Сайт использует файлы cookie для обеспечения корректной работы. Cookie не содержат
            персональных данных. Вы можете отключить cookie в настройках браузера, однако это
            может повлиять на функциональность Сайта.
          </p>
        </section>

        <section aria-labelledby="contact">
          <h2 id="contact" className="text-xl font-semibold text-foreground">
            8. Контакты
          </h2>
          <p className="mt-3">
            По вопросам, связанным с обработкой персональных данных, обращайтесь:
          </p>
          <address className="mt-3 not-italic space-y-1 text-sm">
            <p><strong>{BRAND_CONFIG.companyName}</strong></p>
            {BRAND_CONFIG.addresses[0] && <p>{BRAND_CONFIG.addresses[0].address}</p>}
            <p>
              Email:{' '}
              <a href={`mailto:${BRAND_CONFIG.email}`} className="text-primary hover:underline">
                {BRAND_CONFIG.email}
              </a>
            </p>
            {BRAND_CONFIG.phones[0] && (
              <p>
                Телефон:{' '}
                <a
                  href={`tel:${BRAND_CONFIG.phones[0].number.replace(/\D/g, '')}`}
                  className="text-primary hover:underline"
                >
                  {BRAND_CONFIG.phones[0].number}
                </a>
              </p>
            )}
          </address>
        </section>
      </div>
    </div>
  )
}

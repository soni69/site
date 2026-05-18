import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload'

/**
 * ISR: страница обновляется не чаще одного раза в 10 минут.
 * Требования: 5.1, 5.3, 5.4, 16.3, 16.4
 */
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Цены на ремонт — KIRO Сервис',
  description:
    'Актуальный прайс-лист на ремонт смартфонов, ноутбуков, планшетов и другой электроники. Цены на все виды работ.',
  openGraph: {
    title: 'Цены на ремонт — KIRO Сервис',
    description: 'Прайс-лист на все виды ремонта электроники.',
    type: 'website',
  },
}

// ─── Типы ────────────────────────────────────────────────────────────────────

interface PriceItem {
  id?: string | null
  name: string
  price: string | null
  note: string | null
}

interface PriceCategory {
  id: string
  category: string
  sortOrder: number
  items: PriceItem[]
}

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchPriceList(): Promise<PriceCategory[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'price-list',
      limit: 200,
      sort: 'sortOrder',
    })

    return result.docs.map((doc) => {
      const items: PriceItem[] = (
        Array.isArray(doc.items) ? doc.items : []
      ).map((item) => {
        const i = item as {
          id?: unknown
          name: string
          price?: string | null
          note?: string | null
        }
        return {
          id: i.id ? String(i.id) : null,
          name: i.name,
          price: i.price ?? null,
          note: i.note ?? null,
        }
      })

      return {
        id: String(doc.id),
        category: doc.category,
        sortOrder: typeof doc.sortOrder === 'number' ? doc.sortOrder : 0,
        items,
      }
    })
  } catch {
    return []
  }
}

// ─── Компоненты ───────────────────────────────────────────────────────────────

function PriceCategoryTable({ group }: { group: PriceCategory }) {
  return (
    <section
      aria-labelledby={`category-${group.id}`}
      className="overflow-hidden rounded-xl border border-border"
    >
      {/* Заголовок категории */}
      <div className="border-b border-border bg-muted/50 px-4 py-3 sm:px-6">
        <h2
          id={`category-${group.id}`}
          className="text-base font-semibold text-foreground"
        >
          {group.category}
        </h2>
      </div>

      {group.items.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground sm:px-6">
          Позиции не добавлены.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-6"
                >
                  Вид работы
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Цена
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell"
                >
                  Примечание
                </th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground sm:px-6">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                    {item.price ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {item.note ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ─── Страница ─────────────────────────────────────────────────────────────────

/**
 * Страница /prices — прайс-лист, сгруппированный по категориям.
 * Требования: 5.1, 5.3, 5.4
 */
export default async function PricesPage() {
  const priceList = await fetchPriceList()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Заголовок страницы */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Цены на ремонт
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Актуальный прайс-лист на все виды работ. Точная стоимость определяется
          после диагностики.
        </p>
      </div>

      {priceList.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-muted-foreground">
            Прайс-лист временно недоступен. Пожалуйста, свяжитесь с нами для
            уточнения цен.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {priceList.map((group) => (
            <PriceCategoryTable key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Дисклеймер */}
      <p className="mt-8 text-sm text-muted-foreground">
        * Цены носят ориентировочный характер. Окончательная стоимость
        определяется после диагностики устройства. Все цены указаны в рублях.
      </p>
    </div>
  )
}

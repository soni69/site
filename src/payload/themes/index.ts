/**
 * Готовые темы (формат совместим с shadcn/ui).
 * Можно дополнять — просто добавь новую тему в массив.
 *
 * Источники тем:
 * - https://tweakcn.com — визуальный редактор + готовые темы
 * - https://ui.shadcn.com/themes — официальные темы
 * - https://shadcnstudio.com/theme-generator
 */

export interface ThemePack {
  id: string
  name: string
  description: string
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

export const BUILTIN_THEMES: ThemePack[] = [
  {
    id: 'default',
    name: 'По умолчанию',
    description: 'Стандартная синяя тема Next.js + shadcn',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--primary': '221.2 83.2% 53.3%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '210 40% 96.1%',
        '--secondary-foreground': '222.2 47.4% 11.2%',
        '--muted': '210 40% 96.1%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '210 40% 96.1%',
        '--accent-foreground': '222.2 47.4% 11.2%',
        '--border': '214.3 31.8% 91.4%',
        '--ring': '221.2 83.2% 53.3%',
        '--radius': '0.5rem',
      },
      dark: {
        '--background': '222.2 84% 4.9%',
        '--foreground': '210 40% 98%',
        '--primary': '217.2 91.2% 59.8%',
        '--primary-foreground': '222.2 47.4% 11.2%',
        '--secondary': '217.2 32.6% 17.5%',
        '--secondary-foreground': '210 40% 98%',
        '--muted': '217.2 32.6% 17.5%',
        '--muted-foreground': '215 20.2% 65.1%',
        '--accent': '217.2 32.6% 17.5%',
        '--accent-foreground': '210 40% 98%',
        '--border': '217.2 32.6% 17.5%',
        '--ring': '224.3 76.3% 48%',
        '--radius': '0.5rem',
      },
    },
  },
  {
    id: 'emerald',
    name: 'Изумрудная',
    description: 'Свежая зелёная тема, подходит для эко-брендов и услуг',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '170 20% 10%',
        '--primary': '160 84% 39%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '170 30% 95%',
        '--secondary-foreground': '170 20% 15%',
        '--muted': '170 20% 95%',
        '--muted-foreground': '170 10% 45%',
        '--accent': '160 60% 92%',
        '--accent-foreground': '160 80% 20%',
        '--border': '170 20% 88%',
        '--ring': '160 84% 39%',
        '--radius': '0.75rem',
      },
      dark: {
        '--background': '170 30% 8%',
        '--foreground': '170 10% 95%',
        '--primary': '160 70% 45%',
        '--primary-foreground': '170 30% 5%',
        '--secondary': '170 20% 15%',
        '--secondary-foreground': '170 10% 90%',
        '--muted': '170 20% 18%',
        '--muted-foreground': '170 10% 65%',
        '--accent': '160 50% 20%',
        '--accent-foreground': '160 80% 80%',
        '--border': '170 20% 20%',
        '--ring': '160 70% 45%',
        '--radius': '0.75rem',
      },
    },
  },
  {
    id: 'rose',
    name: 'Розовая',
    description: 'Тёплая розовая тема для красоты, моды, лайфстайла',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '350 20% 12%',
        '--primary': '346 77% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '350 30% 96%',
        '--secondary-foreground': '350 20% 15%',
        '--muted': '350 20% 96%',
        '--muted-foreground': '350 10% 45%',
        '--accent': '346 60% 94%',
        '--accent-foreground': '346 80% 25%',
        '--border': '350 20% 90%',
        '--ring': '346 77% 50%',
        '--radius': '0.625rem',
      },
      dark: {
        '--background': '350 25% 7%',
        '--foreground': '350 10% 95%',
        '--primary': '346 65% 55%',
        '--primary-foreground': '350 25% 5%',
        '--secondary': '350 20% 15%',
        '--secondary-foreground': '350 10% 90%',
        '--muted': '350 20% 18%',
        '--muted-foreground': '350 10% 65%',
        '--accent': '346 40% 25%',
        '--accent-foreground': '346 80% 85%',
        '--border': '350 20% 22%',
        '--ring': '346 65% 55%',
        '--radius': '0.625rem',
      },
    },
  },
  {
    id: 'amber',
    name: 'Янтарная',
    description: 'Тёплая жёлто-оранжевая тема для авто, ремонта, услуг',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '35 30% 12%',
        '--primary': '38 92% 50%',
        '--primary-foreground': '35 30% 10%',
        '--secondary': '40 50% 96%',
        '--secondary-foreground': '35 30% 15%',
        '--muted': '40 30% 95%',
        '--muted-foreground': '35 15% 45%',
        '--accent': '38 80% 92%',
        '--accent-foreground': '38 90% 25%',
        '--border': '40 30% 88%',
        '--ring': '38 92% 50%',
        '--radius': '0.5rem',
      },
      dark: {
        '--background': '35 25% 8%',
        '--foreground': '40 15% 95%',
        '--primary': '38 88% 55%',
        '--primary-foreground': '35 30% 8%',
        '--secondary': '35 20% 15%',
        '--secondary-foreground': '40 15% 90%',
        '--muted': '35 20% 18%',
        '--muted-foreground': '40 10% 65%',
        '--accent': '38 50% 25%',
        '--accent-foreground': '38 90% 85%',
        '--border': '35 20% 22%',
        '--ring': '38 88% 55%',
        '--radius': '0.5rem',
      },
    },
  },
  {
    id: 'slate',
    name: 'Графит',
    description: 'Минималистичная тема в серых тонах. Универсально и строго',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '215 28% 12%',
        '--primary': '215 28% 17%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '215 16% 95%',
        '--secondary-foreground': '215 28% 17%',
        '--muted': '215 16% 95%',
        '--muted-foreground': '215 10% 45%',
        '--accent': '215 16% 92%',
        '--accent-foreground': '215 28% 17%',
        '--border': '215 16% 88%',
        '--ring': '215 28% 17%',
        '--radius': '0.375rem',
      },
      dark: {
        '--background': '215 28% 8%',
        '--foreground': '215 10% 95%',
        '--primary': '215 10% 90%',
        '--primary-foreground': '215 28% 12%',
        '--secondary': '215 20% 15%',
        '--secondary-foreground': '215 10% 90%',
        '--muted': '215 20% 18%',
        '--muted-foreground': '215 10% 65%',
        '--accent': '215 20% 22%',
        '--accent-foreground': '215 10% 90%',
        '--border': '215 20% 22%',
        '--ring': '215 10% 90%',
        '--radius': '0.375rem',
      },
    },
  },
  {
    id: 'violet',
    name: 'Фиолетовая',
    description: 'Современная фиолетовая тема для tech, IT, креативных проектов',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '263 30% 12%',
        '--primary': '263 70% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '263 30% 96%',
        '--secondary-foreground': '263 30% 15%',
        '--muted': '263 20% 95%',
        '--muted-foreground': '263 10% 45%',
        '--accent': '263 60% 94%',
        '--accent-foreground': '263 80% 25%',
        '--border': '263 20% 90%',
        '--ring': '263 70% 50%',
        '--radius': '0.75rem',
      },
      dark: {
        '--background': '263 25% 7%',
        '--foreground': '263 10% 95%',
        '--primary': '263 70% 65%',
        '--primary-foreground': '263 25% 5%',
        '--secondary': '263 20% 15%',
        '--secondary-foreground': '263 10% 90%',
        '--muted': '263 20% 18%',
        '--muted-foreground': '263 10% 65%',
        '--accent': '263 40% 25%',
        '--accent-foreground': '263 80% 85%',
        '--border': '263 20% 22%',
        '--ring': '263 70% 65%',
        '--radius': '0.75rem',
      },
    },
  },
]

export function getThemeById(id: string): ThemePack | undefined {
  return BUILTIN_THEMES.find((t) => t.id === id)
}

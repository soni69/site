import type { GlobalConfig } from 'payload'
import { BUILTIN_THEMES } from '../themes'

export const Theme: GlobalConfig = {
  slug: 'theme',
  label: 'Дизайн сайта',
  admin: {
    group: 'Настройки',
    description: 'Внешний вид публичной части сайта. Выберите готовую тему или вставьте свою',
  },
  fields: [
    {
      name: 'source',
      type: 'radio',
      label: 'Источник темы',
      defaultValue: 'builtin',
      options: [
        { label: 'Готовая тема из коллекции', value: 'builtin' },
        { label: 'Свой JSON (с tweakcn.com или другого источника)', value: 'custom' },
      ],
      admin: {
        layout: 'horizontal',
      },
    },
    {
      name: 'builtinTheme',
      type: 'select',
      label: 'Готовая тема',
      defaultValue: 'default',
      admin: {
        condition: (data) => data?.source === 'builtin' || !data?.source,
        description: 'Готовые темы в стиле shadcn/ui. Можно дополнять файл src/payload/themes/index.ts',
      },
      options: BUILTIN_THEMES.map((t) => ({
        label: `${t.name} — ${t.description}`,
        value: t.id,
      })),
    },
    {
      name: 'customCss',
      type: 'code',
      label: 'CSS переменные (свой стиль)',
      admin: {
        condition: (data) => data?.source === 'custom',
        language: 'css',
        description:
          'Вставьте CSS переменные в формате shadcn/ui. Готовые темы можно взять с tweakcn.com — кнопка "Copy" → "CSS Variables"',
      },
      defaultValue: `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
}`,
    },
    {
      name: 'fontFamily',
      type: 'select',
      label: 'Основной шрифт',
      defaultValue: 'Inter',
      admin: {
        description: 'Шрифт применяется ко всей публичной части сайта',
      },
      options: [
        { label: 'Inter (универсальный, рекомендуется)', value: 'Inter' },
        { label: 'Roboto', value: 'Roboto' },
        { label: 'Open Sans', value: 'Open Sans' },
        { label: 'Manrope', value: 'Manrope' },
        { label: 'Montserrat', value: 'Montserrat' },
        { label: 'Nunito', value: 'Nunito' },
        { label: 'Poppins', value: 'Poppins' },
        { label: 'PT Sans', value: 'PT Sans' },
        { label: 'Системный (без загрузки)', value: 'system-ui' },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  fields: [
    {
      name: 'companyName',
      type: 'text',
      label: 'Название компании',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Слоган',
    },
    {
      name: 'phones',
      type: 'array',
      label: 'Телефоны',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Подпись',
        },
        {
          name: 'number',
          type: 'text',
          label: 'Номер телефона',
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
    },
    {
      name: 'addresses',
      type: 'array',
      label: 'Адреса',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Подпись',
        },
        {
          name: 'address',
          type: 'text',
          label: 'Адрес',
        },
        {
          name: 'mapUrl',
          type: 'text',
          label: 'Ссылка на карту',
        },
        {
          name: 'lat',
          type: 'number',
          label: 'Широта',
        },
        {
          name: 'lng',
          type: 'number',
          label: 'Долгота',
        },
      ],
    },
    {
      name: 'workingHours',
      type: 'textarea',
      label: 'Часы работы',
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      label: 'Номер WhatsApp',
    },
    {
      name: 'whatsappMessage',
      type: 'text',
      label: 'Предзаполненное сообщение WhatsApp',
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Социальные сети',
      fields: [
        {
          name: 'vk',
          type: 'text',
          label: 'ВКонтакте',
        },
        {
          name: 'telegram',
          type: 'text',
          label: 'Telegram',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
        },
      ],
    },
    {
      name: 'primaryColor',
      type: 'text',
      label: 'Основной цвет',
      defaultValue: '#2563eb',
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Логотип',
      relationTo: 'media',
    },
  ],
}

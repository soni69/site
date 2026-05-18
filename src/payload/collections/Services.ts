import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from './Users'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Название услуги',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL-идентификатор)',
      admin: {
        description: 'Уникальный идентификатор для URL, например: remont-ekrana-iphone',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'service-categories',
      label: 'Категория',
      admin: {
        description: 'Категория, к которой относится услуга',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      label: 'Краткое описание',
      admin: {
        description: 'Отображается в карточке услуги на странице /services',
      },
    },
    {
      name: 'fullDescription',
      type: 'richText',
      label: 'Полное описание',
      admin: {
        description: 'Подробное описание услуги на странице /services/[slug]',
      },
    },
    {
      name: 'priceFrom',
      type: 'number',
      label: 'Цена от (₽)',
      admin: {
        description: 'Минимальная цена услуги для отображения в карточке',
      },
    },
    {
      name: 'priceTable',
      type: 'array',
      label: 'Таблица цен',
      admin: {
        description: 'Детальный прайс-лист для страницы услуги',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название работы',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          label: 'Цена (или диапазон)',
          required: true,
          admin: {
            description: 'Например: "500–1500" или "от 800"',
          },
        },
        {
          name: 'note',
          type: 'text',
          label: 'Примечание',
        },
      ],
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Фотографии',
      admin: {
        description: 'Фото для галереи на странице услуги',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Изображение',
        },
      ],
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Похожие услуги',
      admin: {
        description: 'Отображаются в секции «Похожие услуги» (не более 3)',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO-настройки',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'SEO-заголовок (title)',
          admin: {
            description: 'Если не заполнено, используется название услуги',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'SEO-описание (meta description)',
          admin: {
            description: 'Рекомендуемая длина: 120–160 символов',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Open Graph изображение',
          admin: {
            description: 'Изображение для превью при шаринге в соцсетях (1200×630 px)',
          },
        },
      ],
    },
    {
      name: '_status',
      type: 'select',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликовано', value: 'published' },
      ],
      defaultValue: 'draft',
      label: 'Статус публикации',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default Services

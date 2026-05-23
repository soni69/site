import type { CollectionConfig } from 'payload'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  labels: {
    singular: 'Работа',
    plural: 'Портфолио',
  },
  admin: {
    group: 'Контент',
    useAsTitle: 'title',
    defaultColumns: ['title', 'completedAt', '_status'],
    description: 'Выполненные работы',
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
      label: 'Название работы',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'beforePhotos',
      type: 'array',
      label: 'Фото «До»',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение',
        },
      ],
    },
    {
      name: 'afterPhotos',
      type: 'array',
      label: 'Фото «После»',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение',
        },
      ],
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      label: 'Связанная услуга',
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Дата выполнения',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: '_status',
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликовано', value: 'published' },
      ],
      defaultValue: 'draft',
    },
  ],
}

export default Portfolio

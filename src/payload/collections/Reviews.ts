import type { CollectionConfig } from 'payload'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Отзыв',
    plural: 'Отзывы',
  },
  admin: {
    group: 'Контент',
    useAsTitle: 'clientName',
    defaultColumns: ['clientName', 'rating', 'reviewDate', '_status'],
    description: 'Отзывы клиентов',
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'clientName',
      type: 'text',
      required: true,
      label: 'Имя клиента',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Рейтинг (1–5)',
      min: 1,
      max: 5,
      admin: {
        description: 'Оценка от 1 до 5',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      label: 'Текст отзыва',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото клиента',
    },
    {
      name: 'reviewDate',
      type: 'date',
      required: true,
      label: 'Дата отзыва',
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

export default Reviews

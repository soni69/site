import type { CollectionConfig } from 'payload'

const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  labels: {
    singular: 'Категория',
    plural: 'Категории услуг',
  },
  admin: {
    group: 'Услуги',
    useAsTitle: 'name',
    defaultColumns: ['name', 'sortOrder'],
    description: 'Категории, по которым группируются услуги',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название категории',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL-идентификатор)',
      admin: {
        description: 'Уникальный идентификатор для URL, например: remont-smartfonov',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Порядок сортировки',
      defaultValue: 0,
      admin: {
        description: 'Меньшее число — выше в списке',
      },
    },
  ],
}

export default ServiceCategories

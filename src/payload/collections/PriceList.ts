import type { CollectionConfig } from 'payload'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const PriceList: CollectionConfig = {
  slug: 'price-list',
  admin: {
    useAsTitle: 'category',
    defaultColumns: ['category', 'sortOrder'],
    description: 'Прайс-лист услуг, сгруппированный по категориям',
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'category',
      type: 'text',
      required: true,
      label: 'Категория',
      admin: {
        description: 'Название категории услуг, например: «Ремонт смартфонов»',
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
    {
      name: 'items',
      type: 'array',
      label: 'Позиции прайса',
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
          label: 'Цена',
          admin: {
            description: 'Например: «от 500 ₽» или «500–1500 ₽»',
          },
        },
        {
          name: 'note',
          type: 'text',
          label: 'Примечание',
          admin: {
            description: 'Необязательное уточнение к позиции',
          },
        },
      ],
    },
  ],
}

export default PriceList

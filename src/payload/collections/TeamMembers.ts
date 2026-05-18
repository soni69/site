import type { CollectionConfig } from 'payload'

const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'sortOrder', '_status'],
    description: 'Сотрудники компании, отображаемые на странице «О нас»',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Имя сотрудника',
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      label: 'Должность',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фотография',
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
      name: '_status',
      type: 'select',
      label: 'Статус публикации',
      defaultValue: 'draft',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
      ],
    },
  ],
}

export default TeamMembers

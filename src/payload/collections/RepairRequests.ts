import type { CollectionConfig } from 'payload'
import { isAdmin } from './Users'

const RepairRequests: CollectionConfig = {
  slug: 'repair-requests',
  labels: {
    singular: 'Заявка',
    plural: 'Заявки на ремонт',
  },
  admin: {
    group: 'Заявки',
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'service', 'status', 'createdAt'],
    description: 'Заявки на ремонт, поступившие через форму на сайте',
  },
  access: {
    // Публичное создание — любой посетитель может отправить заявку
    create: () => true,
    // Чтение, обновление и удаление — только администратор
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Имя клиента',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Телефон',
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      // Не обязательное: заявки из quick-contact и других источников могут не содержать услугу
      required: false,
      label: 'Услуга',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание проблемы',
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Фотографии',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          label: 'Файл',
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      label: 'Источник заявки',
      options: [
        { label: 'Форма записи', value: 'form' },
        { label: 'Калькулятор', value: 'calculator' },
        { label: 'Быстрая связь', value: 'quick-contact' },
      ],
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Дата создания',
      admin: {
        readOnly: true,
        description: 'Заполняется автоматически при создании заявки',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус заявки',
      defaultValue: 'new',
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'in-progress' },
        { label: 'Выполнена', value: 'done' },
        { label: 'Отменена', value: 'cancelled' },
      ],
    },
    {
      // Honeypot-поле для защиты от спама — скрыто в интерфейсе
      name: 'honeypot',
      type: 'text',
      label: 'Honeypot',
      admin: {
        hidden: true,
        description: 'Скрытое поле для защиты от спам-ботов. Должно оставаться пустым.',
      },
    },
  ],
}

export default RepairRequests

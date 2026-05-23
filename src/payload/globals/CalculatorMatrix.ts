import type { GlobalConfig } from 'payload'

export const CalculatorMatrix: GlobalConfig = {
  slug: 'calculator-matrix',
  label: 'Матрица калькулятора',
  admin: {
    group: 'Настройки',
    description: 'Настройка типов устройств, неисправностей и цен для онлайн-калькулятора стоимости ремонта',
  },
  fields: [
    {
      name: 'deviceTypes',
      type: 'array',
      label: 'Типы устройств',
      admin: {
        description: 'Список типов устройств с вложенными неисправностями и ценами',
      },
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          label: 'Идентификатор',
          admin: {
            description: 'Уникальный идентификатор типа устройства, например: smartphone, laptop, tablet',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Название',
          admin: {
            description: 'Отображаемое название, например: «Смартфон», «Ноутбук», «Планшет»',
          },
        },
        {
          name: 'faults',
          type: 'array',
          label: 'Неисправности',
          admin: {
            description: 'Список неисправностей для данного типа устройства',
          },
          fields: [
            {
              name: 'id',
              type: 'text',
              required: true,
              label: 'Идентификатор',
              admin: {
                description: 'Уникальный идентификатор неисправности, например: screen, battery, charging',
              },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Название',
              admin: {
                description: 'Отображаемое название, например: «Замена экрана», «Замена аккумулятора»',
              },
            },
            {
              name: 'minPrice',
              type: 'number',
              required: true,
              label: 'Минимальная цена (₽)',
              min: 0,
              admin: {
                description: 'Нижняя граница стоимости ремонта в рублях',
              },
            },
            {
              name: 'maxPrice',
              type: 'number',
              required: true,
              label: 'Максимальная цена (₽)',
              min: 0,
              admin: {
                description: 'Верхняя граница стоимости ремонта в рублях',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'disclaimer',
      type: 'text',
      label: 'Дисклеймер',
      defaultValue: 'Цены ориентировочные. Точная стоимость определяется после диагностики.',
      admin: {
        description: 'Предупреждение об ориентировочности цен, отображается под результатом расчёта',
      },
    },
  ],
}

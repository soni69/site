import type { CollectionConfig, Access, FieldHook } from 'payload'

// Доступ только для администраторов
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

// Доступ для администраторов и редакторов
export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

/**
 * Первый зарегистрированный пользователь автоматически становится администратором.
 * Все последующие — редакторами по умолчанию (роль настраивается администратором).
 */
const setFirstUserAsAdmin: FieldHook = async ({ value, operation, req }) => {
  if (operation !== 'create') return value

  const existing = await req.payload.count({ collection: 'users' })
  if (existing.totalDocs === 0) {
    return 'admin'
  }
  return value ?? 'editor'
}

const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  admin: {
    group: 'Доступ',
    useAsTitle: 'email',
    description: 'Управление администраторами и редакторами',
  },
  auth: {
    tokenExpiration: 28800,
    useAPIKey: false,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      label: 'Роль',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
      ],
      hooks: {
        beforeChange: [setFirstUserAsAdmin],
      },
      admin: {
        // Скрываем поле при регистрации первого пользователя (нет авторизованного юзера)
        // Поле появляется только когда администратор создаёт/редактирует других пользователей
        condition: (_data, _siblingData, { user }) => Boolean(user),
      },
    },
  ],
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}

export default Users

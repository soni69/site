import type { CollectionConfig, Access } from 'payload'

// Access function: allows only users with role 'admin'
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

// Access function: allows users with role 'admin' or 'editor'
export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 28800, // 8 hours
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'editor'],
      required: true,
      defaultValue: 'editor',
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

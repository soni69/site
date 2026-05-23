import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const Blog: CollectionConfig = {
  slug: 'blog',
  labels: {
    singular: 'Статья',
    plural: 'Статьи',
  },
  admin: {
    group: 'Контент',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    description: 'Статьи блога',
  },
  versions: {
    drafts: true,
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
      label: 'Заголовок',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: {
        description: 'Уникальный URL-идентификатор статьи (например: remont-televizorov)',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Превью-изображение',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Краткое описание',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Содержимое статьи',
      editor: lexicalEditor({}),
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Теги',
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Тег',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Дата публикации',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'SEO-заголовок',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'SEO-описание',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Open Graph изображение',
        },
      ],
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

export default Blog

import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Dispatch = defineDocumentType(() => ({
  name: 'Dispatch',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    authors: { type: 'list', of: { type: 'string' }, required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
  },
}));

export default makeSource({
  contentDirPath: 'content/dispatches', // 👈 updated folder name
  documentTypes: [Dispatch],
});
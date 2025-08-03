
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Dispatch = defineDocumentType(() => ({
  name: 'Dispatch',
  filePathPattern: `dispatches/*.mdx`,
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
  contentDirPath: 'content',
  documentTypes: [Dispatch],
  mdx: {
    remarkPlugins: [[remarkGfm]] as any,
    rehypePlugins: [[rehypePrettyCode]] as any,
  },
});
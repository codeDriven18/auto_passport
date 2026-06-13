import { useEffect } from 'react';

export interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile';
}

function upsertMeta(property: string, content: string, attr: 'name' | 'property' = 'property') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function usePageMeta(meta: PageMeta | null) {
  useEffect(() => {
    const previousTitle = document.title;

    if (!meta) {
      document.title = 'SwipeJobs';
      return () => {
        document.title = previousTitle;
      };
    }

    if (meta.title) document.title = meta.title;
    if (meta.description) upsertMeta('description', meta.description, 'name');
    if (meta.title) upsertMeta('og:title', meta.title);
    if (meta.description) upsertMeta('og:description', meta.description);
    if (meta.image) upsertMeta('og:image', meta.image);
    if (meta.url) upsertMeta('og:url', meta.url);
    upsertMeta('og:type', meta.type ?? 'website');
    upsertMeta('twitter:card', meta.image ? 'summary_large_image' : 'summary', 'name');
    if (meta.title) upsertMeta('twitter:title', meta.title, 'name');
    if (meta.description) upsertMeta('twitter:description', meta.description, 'name');
    if (meta.image) upsertMeta('twitter:image', meta.image, 'name');

    return () => {
      document.title = previousTitle;
    };
  }, [meta?.title, meta?.description, meta?.image, meta?.url, meta?.type]);
}

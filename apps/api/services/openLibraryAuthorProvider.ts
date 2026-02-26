import axios from 'axios';
import {
  buildOpenLibraryAuthorCoverUrl,
  buildOpenLibraryAuthorSearchUrl,
  buildOpenLibraryAuthorWorksUrl,
  buildOpenLibraryBookCoverUrl,
  openLibraryHeaders,
} from './openLibraryClient';

interface OpenLibraryAuthorDoc {
  name?: string;
  key?: string;
  birth_date?: string;
  top_work?: string;
  work_count?: number;
  photos?: Array<number | string>;
}

interface OpenLibraryWorkDoc {
  title?: string;
  key?: string;
  first_publish_year?: number;
  covers?: Array<number | string>;
}

export interface OpenLibraryAuthorInfo {
  author: {
    name?: string;
    key?: string;
    birthDate: string | null;
    topWork: string | null;
    workCount: number;
    photoUrl: string | null;
  };
  works: Array<{
    title: string;
    key?: string;
    firstPublishYear: number | null;
    coverId: number | string | null;
    cover: string | null;
  }>;
}

export interface OpenLibraryAuthorSearchAuthor {
  name?: string;
  key?: string;
  birth_date: string | null;
  top_work: string | null;
  work_count: number;
  photos: Array<number | string>;
  photo_url: string | null;
}

export const fetchOpenLibraryAuthorInfoByName = async (
  authorName: string,
): Promise<OpenLibraryAuthorInfo | null> => {
  const authorsResponse = await axios.get(
    buildOpenLibraryAuthorSearchUrl(encodeURIComponent(authorName)),
    { headers: openLibraryHeaders },
  );

  if (!authorsResponse.data.docs || authorsResponse.data.docs.length === 0) {
    return null;
  }

  const authorData = authorsResponse.data.docs[0] as OpenLibraryAuthorDoc;
  const author = {
    name: authorData.name,
    key: authorData.key,
    birthDate: authorData.birth_date || null,
    topWork: authorData.top_work || null,
    workCount: authorData.work_count || 0,
    photoUrl:
      authorData.photos && authorData.photos.length > 0
        ? buildOpenLibraryAuthorCoverUrl(authorData.photos[0])
        : null,
  };

  let works: OpenLibraryAuthorInfo['works'] = [];
  if (author.key) {
    const worksResponse = await axios.get(
      buildOpenLibraryAuthorWorksUrl(author.key, 10),
      { headers: openLibraryHeaders },
    );

    if (worksResponse.data.entries && worksResponse.data.entries.length > 0) {
      works = (worksResponse.data.entries as OpenLibraryWorkDoc[]).map(
        (work) => ({
          title: work.title || 'Unknown Title',
          key: work.key,
          firstPublishYear: work.first_publish_year || null,
          coverId: work.covers?.[0] || null,
          cover: work.covers?.[0]
            ? buildOpenLibraryBookCoverUrl(work.covers[0])
            : null,
        }),
      );
    }
  }

  return { author, works };
};

export const searchOpenLibraryAuthorByName = async (
  name: string,
): Promise<OpenLibraryAuthorSearchAuthor | null> => {
  const authorsResponse = await axios.get(
    buildOpenLibraryAuthorSearchUrl(encodeURIComponent(name)),
    { headers: openLibraryHeaders },
  );

  if (!authorsResponse.data.docs || authorsResponse.data.docs.length === 0) {
    return null;
  }

  const authorData = authorsResponse.data.docs[0] as OpenLibraryAuthorDoc;
  return {
    name: authorData.name,
    key: authorData.key,
    birth_date: authorData.birth_date || null,
    top_work: authorData.top_work || null,
    work_count: authorData.work_count || 0,
    photos: authorData.photos || [],
    photo_url:
      authorData.photos && authorData.photos.length > 0
        ? buildOpenLibraryAuthorCoverUrl(authorData.photos[0])
        : null,
  };
};

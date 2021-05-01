/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // Stores Fetched Posts
  const [results, setResults] = useState(postsPagination.results);
  // Stores link to fecth more Posts if there are any
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  // Fetch next_page posts
  const handleFetchMorePosts = async () => {
    const data = await fetch(nextPage);

    if (!nextPage) return; // Do not fetch if there is no link

    const response: PostPagination = await data.json();
    setNextPage(response.next_page);
    if (response.results)
      setResults([
        ...results,
        {
          uid: response.results[0].uid,
          first_publication_date: format(
            new Date(response.results[0].first_publication_date),
            'd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
          data: {
            title: RichText.asText(response.results[0].data.title),
            subtitle: RichText.asText(response.results[0].data.subtitle),
            author: RichText.asText(response.results[0].data.author),
          },
        },
      ]);
  };

  return (
    <div className={styles.mainContainer}>
      <Header />
      <div className={styles.postsContainer}>
        {results.map((post: Post) => (
          <Link key={`${post.uid}-link`} href={`post/${post.uid}`}>
            <a key={post.uid}>
              <div key={`${post.uid}-div`} className={styles.post}>
                <p key={post.data.title} className={styles.postTitle}>
                  {post.data.title}
                </p>
                <p key={post.data.subtitle} className={styles.postSubtitle}>
                  {post.data.subtitle}
                </p>
                <div key={`${post.uid}-moreInfo`} className={styles.moreInfo}>
                  <div key={`${post.uid}-dateInfo`} className={styles.dateInfo}>
                    <FiCalendar key={`${post.uid}-fiCalendar`} />
                    <p key={post.first_publication_date}>
                      {post.first_publication_date}
                    </p>
                  </div>
                  <div
                    key={`${post.uid}-authorInfo`}
                    className={styles.authorInfo}
                  >
                    <FiUser key={`${post.uid}-fiUser`} />
                    <p key={post.data.author}>{post.data.author}</p>
                  </div>
                </div>
              </div>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button type="button" onClick={handleFetchMorePosts}>
            Carregar mais posts
          </button>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );
  const { next_page } = postsResponse;
  const results: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
  };
};

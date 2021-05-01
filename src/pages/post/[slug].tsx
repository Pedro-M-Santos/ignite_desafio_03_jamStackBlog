import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerContainer}>
        <Header />
      </div>
      <div className={styles.postContainer}>
        <div className={styles.imgContainer}>
          <img src={post.data.banner.url} alt="post-banner" />
        </div>
        <div className={styles.postTitleContainer}>
          <p className={styles.postTitle}>{post.data.title}</p>
        </div>
        <div className={styles.moreInfoContainer}>
          <div className={styles.dateInfo}>
            <FiCalendar />
            <p key={post.first_publication_date}>
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </p>
          </div>
          <div className={styles.authorInfo}>
            <FiUser />
            <p key={post.data.author}>{post.data.author}</p>
          </div>
          <div className={styles.authorInfo}>
            <FiClock />
            <p key={post.data.author}>4 min</p>
          </div>
        </div>
        <div className={styles.content}>
          {post.data.content.map(item => (
            <div className={styles.contentText} key={`main-${item.heading}`}>
              <p className={styles.heading} key={item.heading}>
                {item.heading}
              </p>
              {item.body.map(unit => (
                <p className={styles.bodyText} key={unit.text}>
                  {unit.text}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      fetch: ['post.uid'],
      pageSize: 100,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: String(post.uid) },
  }));
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: Array.isArray(response.data.title)
        ? RichText.asText(response.data.title)
        : response.data.title,
      subtitle: Array.isArray(response.data.subtitle)
        ? RichText.asText(response.data.subtitle)
        : response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: Array.isArray(response.data.author)
        ? RichText.asText(response.data.author)
        : response.data.author,
      content: response.data.content.map(item => {
        return {
          heading: Array.isArray(item.heading)
            ? RichText.asText(item.heading)
            : item.heading,
          body: item.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};

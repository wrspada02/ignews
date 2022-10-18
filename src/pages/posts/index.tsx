import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import styles from './styles.module.scss';
import { RichText } from 'prismic-dom';
import { PrismicLink } from '@prismicio/react';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <section className={styles.posts}>
                    {posts.map((post) => (
                        <PrismicLink href={`/posts/${String(post.slug)}`} key={post.slug}>
                            <>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </>
                        </PrismicLink>
                    ))}
                </section>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient();

    const documents = await prismic.getByType('publication', {
        fetch: ['publication.title', 'publication.content'],
        pageSize: 100,
    });

    const posts = documents.results.map((document) => (
        {
            slug: document.uid,
            title: RichText.asText(document.data.title),
            excerpt: document.data.content.find((content) => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(document.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
        }
    ))

    return {
        props: {
            posts
        },
    }
}
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import styles from './styles.module.scss';
import Prismic from '@prismicio/client';

export default function Posts() {
    return (
       <>
        <Head>
            <title>Posts | Ignews</title>
        </Head>

        <main className={styles.container}>
            <section className={styles.posts}>
                <a href="">
                    <time>12 de marco de 2021</time>
                    <strong>Creating a Monorepo with Learna & Yarn Workspaces</strong>
                    <p>In this guide, you will learn how to create a monorepo to manage multiple packages with a shared </p>
                </a>
                <a href="">
                    <time>12 de marco de 2021</time>
                    <strong>Creating a Monorepo with Learna & Yarn Workspaces</strong>
                    <p>In this guide, you will learn how to create a monorepo to manage multiple packages with a shared </p>
                </a>
                <a href="">
                    <time>12 de marco de 2021</time>
                    <strong>Creating a Monorepo with Learna & Yarn Workspaces</strong>
                    <p>In this guide, you will learn how to create a monorepo to manage multiple packages with a shared </p>
                </a>
            </section>
        </main>
       </> 
    );
}

export const getStaticProps : GetStaticProps = async () => {
    const prismic = getPrismicClient();

    const documents = await prismic.getByType('publication', {
        fetch: ['publication.title', 'publication.content'],
        pageSize: 100,
    });
    console.log(JSON.stringify(documents, null, 2));

    return {
        props: {

        }
    }
}
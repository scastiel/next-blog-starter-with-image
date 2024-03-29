import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import { CMS_NAME } from '../../lib/constants'
import type PostType from '../../interfaces/post'
import sizeOf from 'image-size'
import { join } from 'path'

type Props = {
  post: PostType
  imageSizes: Record<string, { width: number; height: number }>
  morePosts: PostType[]
  preview?: boolean
}

export default function Post({ post, imageSizes, morePosts, preview }: Props) {
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>
                  {post.title} | Next.js Blog Example with {CMS_NAME}
                </title>
                <meta property="og:image" content={post.ogImage.url} />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
              />
              <PostBody content={post.content} imageSizes={imageSizes} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  )
}

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])

  const imageSizes: Props['imageSizes'] = {}

  // A regular expression to iterate on all images in the post
  const iterator = post.content.matchAll(/\!\[.*]\((.*)\)/g)
  let match: IteratorResult<RegExpMatchArray, any>
  while (!(match = iterator.next()).done) {
    const [, src] = match.value
    try {
      const { width, height } = sizeOf(join('public', src))
      imageSizes[src] = { width, height }
    } catch (err) {
      console.error(`Can’t get dimensions for ${src}:`, err)
    }
  }

  return {
    props: { post, imageSizes },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}

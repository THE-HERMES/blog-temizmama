import { addPublicationJsonLd } from "@starter-kit/utils/seo/addPublicationJsonLd";
import { getAutogeneratedPublicationOG } from "@starter-kit/utils/social/og";
import request from "graphql-request";
import { GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { Navbar } from "../components/navbar";
import { Waypoint } from "react-waypoint";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { AppProvider } from "../components/contexts/appContext";
import { Footer } from "../components/footer";
import { CookieBanner } from "../components/CookieBanner";
import { HeroPost } from "../components/hero-post";
import { ArticleSVG, ChevronDownSVG } from "../components/icons";
import { Layout } from "../components/layout";
import { MorePosts } from "../components/more-posts";
import { SecondaryPost } from "../components/secondary-post";
import {
  MorePostsByPublicationDocument,
  MorePostsByPublicationQuery,
  MorePostsByPublicationQueryVariables,
  PageInfo,
  PostFragment,
  PostsByPublicationDocument,
  PostsByPublicationQuery,
  PostsByPublicationQueryVariables,
  PublicationFragment,
} from "../generated/graphql";
import { DEFAULT_COVER } from "../utils/const";

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

type Props = {
  publication: PublicationFragment;
  initialAllPosts: PostFragment[];
  initialPageInfo: PageInfo;
};

export default function Index({
  publication,
  initialAllPosts,
  initialPageInfo,
}: Props) {
  const [allPosts, setAllPosts] = useState<PostFragment[]>(initialAllPosts);
  const [pageInfo, setPageInfo] =
    useState<Props["initialPageInfo"]>(initialPageInfo);
  const [loadedMore, setLoadedMore] = useState(false);

  const loadMore = async () => {
    const data = await request<
      MorePostsByPublicationQuery,
      MorePostsByPublicationQueryVariables
    >(GQL_ENDPOINT, MorePostsByPublicationDocument, {
      first: 10,
      host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
      after: pageInfo.endCursor,
    });
    if (!data.publication) {
      return;
    }
    const newPosts = data.publication.posts.edges.map((edge) => edge.node);
    setAllPosts([...allPosts, ...newPosts]);
    setPageInfo(data.publication.posts.pageInfo);
    setLoadedMore(true);
  };

  const firstPost = allPosts[0];
  const secondaryPosts = allPosts.slice(1, 4).map((post) => {
    return (
      <SecondaryPost
        key={post.id}
        title={post.title}
        coverImage={post.coverImage?.url || DEFAULT_COVER}
        date={post.publishedAt}
        slug={post.slug}
        excerpt={post.brief}
      />
    );
  });
  const morePosts = allPosts.slice(4);

  return (
    <AppProvider publication={publication}>
      <Layout>
        <Head>
          <title>
            {publication.displayTitle ||
              publication.title ||
              "Temizmama Blog"}
          </title>
          <meta
            name="description"
            content={
              publication.descriptionSEO ||
              publication.title ||
              `${publication.author.name}'s Blog`
            }
          />
          <meta property="twitter:card" content="summary_large_image" />
          <meta
            property="twitter:title"
            content={
              publication.displayTitle ||
              publication.title ||
              "Temizmama Blog"
            }
          />
          <meta
            property="twitter:description"
            content={
              publication.descriptionSEO ||
              publication.title ||
              `${publication.author.name}'s Blog`
            }
          />
          <meta
            property="og:image"
            content={
              publication.ogMetaData.image ||
              getAutogeneratedPublicationOG(publication)
            }
          />
          <meta
            property="twitter:image"
            content={
              publication.ogMetaData.image ||
              getAutogeneratedPublicationOG(publication)
            }
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(addPublicationJsonLd(publication)),
            }}
          />
        </Head>
        <Navbar />

        <Container className="flex flex-col items-stretch gap-10 px-5 pb-10">
          
          <div className="text-center">
            <h1 className="text-5xl text-gray-900 font-semibold mt-2 mb-5">
              Temizmama Blog
            </h1>
            <p className="text-md leading-snug text-slate-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
              Sevimli dostlarımız için en taze mamayı sunan Temizmama
              aracılığıyla kedi &amp; köpek bakımı ile ilgili bilinmesi
              gerekenlerin hepsi bu sayfada!
            </p>
          </div>
          {allPosts.length === 0 && (
            <div className="grid grid-cols-1 py-20 lg:grid-cols-3">
              <div className="col-span-1 flex flex-col items-center gap-5 text-center text-slate-700 dark:text-neutral-400 lg:col-start-2">
                <div className="w-20">
                  <ArticleSVG clasName="stroke-current" />
                </div>
                <p className="text-xl font-semibold ">
                </p>
              </div>
            </div>
          )}

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <div className="col-span-1">
              {firstPost && (
                <HeroPost
                  title={firstPost.title}
                  coverImage={firstPost.coverImage?.url || DEFAULT_COVER}
                  date={firstPost.publishedAt}
                  slug={firstPost.slug}
                  excerpt={firstPost.brief}
                />
              )}
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              {secondaryPosts}
            </div>
          </div>

          {morePosts.length > 0 && (
            <>
              <MorePosts context="home" posts={morePosts} />
              {!loadedMore && pageInfo.hasNextPage && pageInfo.endCursor && (
                <div className="flex w-full flex-row items-center justify-center">
                  <Button
                    onClick={loadMore}
                    type="outline"
                    icon={<ChevronDownSVG className="h-5 w-5 stroke-current" />}
                    label="Load more posts"
                  />
                </div>
              )}
              {loadedMore && pageInfo.hasNextPage && pageInfo.endCursor && (
                <Waypoint onEnter={loadMore} bottomOffset={"10%"} />
              )}
            </>
          )}
        </Container>
        <Footer />
        <CookieBanner />
      </Layout>
    </AppProvider>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = await request<
    PostsByPublicationQuery,
    PostsByPublicationQueryVariables
  >(GQL_ENDPOINT, PostsByPublicationDocument, {
    first: 10,
    host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
  });

  const publication = data.publication;
  if (!publication) {
    return {
      notFound: true,
    };
  }
  const initialAllPosts = publication.posts.edges.map((edge) => edge.node);

  return {
    props: {
      publication,
      initialAllPosts,
      initialPageInfo: publication.posts.pageInfo,
    },
    revalidate: 1,
  };
};

import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const isDev = process.env.NODE_ENV === 'development';

  const cacheHeader = isDev
    ? 'no-store'
    : 's-maxage=300, stale-while-revalidate=600';

  if (!token) {
    return NextResponse.json(
      { repos: [], error: 'No token' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aryxn-portfolio',
      },
      body: JSON.stringify({
        query: `{
          user(login: "aryxn-builds") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  homepageUrl
                  stargazerCount
                  forkCount
                  isPrivate
                  updatedAt
                  primaryLanguage {
                    name
                    color
                  }
                  repositoryTopics(first: 6) {
                    nodes {
                      topic { name }
                    }
                  }
                }
              }
            }
          }
        }`,
      }),
      // Do NOT pass next.revalidate here — use the export const above
      cache: isDev ? 'no-store' : 'default',
    });

    const json = await response.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      return NextResponse.json(
        { repos: [], error: json.errors[0].message },
        { status: 200, headers: { 'Cache-Control': cacheHeader } }
      );
    }

    const repos = json?.data?.user?.pinnedItems?.nodes ?? [];

    return NextResponse.json(
      { repos, count: repos.length },
      { status: 200, headers: { 'Cache-Control': cacheHeader } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Pinned fetch error:', message);
    return NextResponse.json(
      { repos: [], error: message },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

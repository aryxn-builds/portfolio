import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'No GitHub token configured', repos: [] },
        { status: 401 }
      );
    }

    const query = `
      {
        user(login: "aryxn-builds") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                url
                stargazerCount
                forkCount
                isPrivate
                updatedAt
                primaryLanguage {
                  name
                  color
                }
                repositoryTopics(first: 5) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aryxn-portfolio',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error('GraphQL request failed');
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const pinnedRepos = data?.data?.user?.pinnedItems?.nodes || [];

    return NextResponse.json({
      repos: pinnedRepos,
      count: pinnedRepos.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message, repos: [] }, { status: 500 });
  }
}

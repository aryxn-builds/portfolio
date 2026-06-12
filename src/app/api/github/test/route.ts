import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  // Test 1: Check token exists
  if (!token) {
    return NextResponse.json({
      status: 'ERROR',
      issue: 'GITHUB_TOKEN not found in env',
      fix: 'Add GITHUB_TOKEN to Vercel env vars and redeploy',
    });
  }

  try {
    // Test 2: Check REST token works
    const testRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `bearer ${token}`,
        'User-Agent': 'aryxn-portfolio',
      },
      cache: 'no-store',
    });
    const testData = await testRes.json();

    if (testData.message === 'Bad credentials') {
      return NextResponse.json({
        status: 'ERROR',
        issue: 'Token is invalid or expired',
        fix: 'Generate a new token at github.com/settings/tokens with read:user scope',
      });
    }

    // Test 3: Check GraphQL works + fetch pinned
    const gqlRes = await fetch('https://api.github.com/graphql', {
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
              totalCount
              nodes {
                ... on Repository {
                  name
                  url
                }
              }
            }
          }
        }`,
      }),
      cache: 'no-store',
    });

    const gqlData = await gqlRes.json();

    return NextResponse.json({
      status: 'SUCCESS',
      tokenUser: testData.login,
      pinnedCount: gqlData?.data?.user?.pinnedItems?.totalCount ?? 0,
      pinnedRepos: gqlData?.data?.user?.pinnedItems?.nodes ?? [],
      errors: gqlData.errors ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ status: 'ERROR', issue: message });
  }
}

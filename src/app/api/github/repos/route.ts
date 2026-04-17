import { NextResponse } from "next/server";

export async function GET() {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "aryxn-portfolio",
    };

    // Fetch page 1 and page 2 in parallel to capture all repos (type=all includes private/forked)
    const [page1Res, page2Res] = await Promise.all([
      fetch(
        "https://api.github.com/users/aryxn-builds/repos?per_page=100&page=1&type=all&sort=updated",
        { headers, next: { revalidate: 300 } }
      ),
      fetch(
        "https://api.github.com/users/aryxn-builds/repos?per_page=100&page=2&type=all&sort=updated",
        { headers, next: { revalidate: 300 } }
      ),
    ]);

    if (!page1Res.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${page1Res.status}` },
        { status: page1Res.status }
      );
    }

    const [page1, page2] = await Promise.all([
      page1Res.json(),
      page2Res.ok ? page2Res.json() : Promise.resolve([]),
    ]);

    const allRepos = [
      ...(Array.isArray(page1) ? page1 : []),
      ...(Array.isArray(page2) ? page2 : []),
    ];

    const totalStars = allRepos.reduce(
      (sum, r) => sum + (r.stargazers_count || 0),
      0
    );

    return NextResponse.json(
      { repos: allRepos, totalCount: allRepos.length, totalStars },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch repos" },
      { status: 500 }
    );
  }
}

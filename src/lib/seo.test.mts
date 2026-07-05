import assert from "node:assert/strict";
import test from "node:test";
import { publicRoutes, publicRouteUrl } from "./public-routes.ts";
import { noIndexMetadata, seoMetadata, siteUrl } from "./seo.ts";

test("public sitemap routes are unique and absolute URLs are canonical", () => {
  const paths = publicRoutes.map((route) => route.path || "/");

  assert.equal(new Set(paths).size, paths.length);
  assert.equal(publicRouteUrl(siteUrl, ""), siteUrl);
  assert.equal(
    publicRouteUrl(siteUrl, "/tours/spine-explorer"),
    "https://www.wildspineuganda.com/tours/spine-explorer",
  );
});

test("SEO metadata sets canonical, social, and crawl directives", () => {
  const metadata = seoMetadata({
    title: "Example Uganda Journey",
    description: "A focused description for a private Uganda journey.",
    path: "/example",
    image: "/images/travel/trail-team.jpg",
  });

  assert.equal(metadata.alternates?.canonical, "/example");
  assert.equal(metadata.openGraph?.url, `${siteUrl}/example`);
  assert.deepEqual(metadata.twitter?.images, ["/images/travel/trail-team.jpg"]);
  assert.ok(metadata.robots && typeof metadata.robots === "object");
  assert.equal(metadata.robots.index, true);
  assert.equal(metadata.robots.follow, true);
});

test("private utility pages receive explicit noindex metadata", () => {
  const metadata = noIndexMetadata("Private page", "Private utility page.");

  assert.ok(metadata.robots && typeof metadata.robots === "object");
  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.robots.follow, false);
  assert.ok(metadata.robots.googleBot && typeof metadata.robots.googleBot === "object");
  assert.equal("noimageindex" in metadata.robots.googleBot, true);
});

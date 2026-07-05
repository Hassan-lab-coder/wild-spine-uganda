import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const root = process.cwd();
const appDir = path.join(root, "src", "app");
const publicDir = path.join(root, "public");
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function listFiles(directory, extensions) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, extensions));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function routeFromPage(file) {
  const relativeDirectory = path.relative(appDir, path.dirname(file));
  const segments = relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));

  return segments.length ? `/${segments.join("/")}` : "/";
}

function normalizeRoute(route) {
  if (route === "/") {
    return route;
  }

  return route.replace(/\/+$/, "");
}

function staticValue(node, constants = new Map()) {
  if (!node) {
    return undefined;
  }

  if (ts.isJsxExpression(node)) {
    return staticValue(node.expression, constants);
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isIdentifier(node)) {
    return constants.get(node.text);
  }

  if (ts.isParenthesizedExpression(node)) {
    return staticValue(node.expression, constants);
  }

  if (ts.isTemplateExpression(node)) {
    let value = node.head.text;

    for (const span of node.templateSpans) {
      const expression = staticValue(span.expression, constants);
      if (expression === undefined) {
        return undefined;
      }
      value += `${expression}${span.literal.text}`;
    }

    return value;
  }

  return undefined;
}

function propertyName(node) {
  if (!node) {
    return undefined;
  }

  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
    return node.text;
  }

  return undefined;
}

function jsxAttribute(node, name) {
  return node.attributes.properties.find(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === name,
  );
}

function attributeValue(attribute, constants) {
  if (!attribute || !ts.isJsxAttribute(attribute)) {
    return undefined;
  }

  if (!attribute.initializer) {
    return true;
  }

  return staticValue(attribute.initializer, constants);
}

function relativeLabel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

const pageFiles = listFiles(appDir, new Set([".tsx"])).filter(
  (file) => path.basename(file) === "page.tsx",
);
const routeToPage = new Map(pageFiles.map((file) => [normalizeRoute(routeFromPage(file)), file]));
const routes = new Set(routeToPage.keys());

const publicRoutesSource = read("src/lib/public-routes.ts");
const publicRoutesAst = ts.createSourceFile(
  "public-routes.ts",
  publicRoutesSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const publicRoutes = [];

function collectPublicRoutes(node) {
  if (
    ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text === "publicRoutes"
    && node.initializer
    && ts.isArrayLiteralExpression(node.initializer)
  ) {
    for (const element of node.initializer.elements) {
      if (!ts.isObjectLiteralExpression(element)) {
        continue;
      }

      const pathProperty = element.properties.find(
        (property) => ts.isPropertyAssignment(property) && propertyName(property.name) === "path",
      );
      const route = pathProperty && ts.isPropertyAssignment(pathProperty)
        ? staticValue(pathProperty.initializer)
        : undefined;

      if (typeof route === "string") {
        publicRoutes.push(normalizeRoute(route || "/"));
      }
    }
  }

  ts.forEachChild(node, collectPublicRoutes);
}

collectPublicRoutes(publicRoutesAst);

if (new Set(publicRoutes).size !== publicRoutes.length) {
  fail("src/lib/public-routes.ts contains duplicate sitemap routes.");
}

for (const route of publicRoutes) {
  if (!routes.has(route)) {
    fail(`Sitemap route ${route} has no matching App Router page.`);
  }
}

const privateRoutes = ["/admin", "/login", "/reset-password", "/thank-you"];
for (const route of privateRoutes) {
  if (publicRoutes.includes(route)) {
    fail(`Private route ${route} must not be included in the sitemap.`);
  }
}

function routeHasOwnMetadata(route, pageFile) {
  if (route === "/") {
    return /export\s+const\s+metadata\b/.test(read("src/app/layout.tsx"));
  }

  let directory = path.dirname(pageFile);

  while (directory !== appDir) {
    const candidates = [path.join(directory, "page.tsx"), path.join(directory, "layout.tsx")];

    for (const candidate of candidates) {
      if (!fs.existsSync(candidate)) {
        continue;
      }

      const source = fs.readFileSync(candidate, "utf8");
      if (/export\s+(?:const|async function)\s+(?:metadata|generateMetadata)\b/.test(source)) {
        return true;
      }
    }

    directory = path.dirname(directory);
  }

  return false;
}

for (const route of publicRoutes) {
  const pageFile = routeToPage.get(route);
  if (pageFile && !routeHasOwnMetadata(route, pageFile)) {
    fail(`Public route ${route} has no route-specific metadata or canonical declaration.`);
  }
}

const sourceFiles = listFiles(appDir, new Set([".tsx"]));
const idsByRoute = new Map();
let imageCount = 0;
let internalLinkCount = 0;
let assetReferenceCount = 0;
const hrefs = [];
const assets = [];
const globalIds = new Set();

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map();
  const ids = new Set();

  function collectConstants(node) {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.initializer
    ) {
      const value = staticValue(node.initializer, constants);
      if (value !== undefined) {
        constants.set(node.name.text, value);
      }
    }
    ts.forEachChild(node, collectConstants);
  }

  collectConstants(ast);

  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(ast);
      const id = attributeValue(jsxAttribute(node, "id"), constants);

      if (typeof id === "string") {
        ids.add(id);
      }

      const href = attributeValue(jsxAttribute(node, "href"), constants);
      if (typeof href === "string") {
        hrefs.push({ href, file });
      }

      const src = attributeValue(jsxAttribute(node, "src"), constants);
      if (typeof src === "string" && src.startsWith("/")) {
        assets.push({ asset: src, file });
      }

      if (tag === "Image" || tag === "img") {
        imageCount += 1;
        const altAttribute = jsxAttribute(node, "alt");

        if (!altAttribute) {
          fail(`${relativeLabel(file)} has an image without an alt attribute.`);
        } else {
          const alt = attributeValue(altAttribute, constants);
          const ariaHidden = attributeValue(jsxAttribute(node, "aria-hidden"), constants);

          if (alt === "" && ariaHidden !== "true" && ariaHidden !== true) {
            fail(`${relativeLabel(file)} has empty image alt text without aria-hidden="true".`);
          }

          if (
            typeof alt === "string"
            && new Set(["image", "photo", "uganda forest", "volunteer uganda"]).has(alt.trim().toLowerCase())
          ) {
            fail(`${relativeLabel(file)} has weak image alt text: "${alt}".`);
          }
        }
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const name = propertyName(node.name);
      const value = staticValue(node.initializer, constants);

      if ((name === "href" || name === "link") && typeof value === "string") {
        hrefs.push({ href: value, file });
      }

      if ((name === "image" || name === "img" || name === "src") && typeof value === "string" && value.startsWith("/")) {
        assets.push({ asset: value, file });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(ast);

  if (file === path.join(appDir, "layout.tsx")) {
    for (const id of ids) {
      globalIds.add(id);
    }
  }

  if (path.basename(file) === "page.tsx") {
    idsByRoute.set(normalizeRoute(routeFromPage(file)), ids);
  }
}

for (const { asset, file } of assets) {
  const assetPath = asset.split(/[?#]/, 1)[0];
  if (!assetPath || assetPath === "/") {
    continue;
  }

  assetReferenceCount += 1;
  const localPath = path.join(publicDir, assetPath.replace(/^\/+/, ""));
  if (!fs.existsSync(localPath)) {
    fail(`${relativeLabel(file)} references missing public asset ${assetPath}.`);
  }
}

for (const { href, file } of hrefs) {
  if (
    !href
    || href.startsWith("http://")
    || href.startsWith("https://")
    || href.startsWith("mailto:")
    || href.startsWith("tel:")
    || href.startsWith("sms:")
  ) {
    continue;
  }

  if (!href.startsWith("/") && !href.startsWith("#")) {
    continue;
  }

  internalLinkCount += 1;
  const sourceRoute = path.basename(file) === "page.tsx"
    ? normalizeRoute(routeFromPage(file))
    : undefined;
  const parsed = new URL(href, `https://local.test${sourceRoute || "/"}`);
  const targetPath = normalizeRoute(parsed.pathname);
  const extension = path.posix.extname(targetPath);

  if (extension) {
    const publicAsset = path.join(publicDir, targetPath.replace(/^\/+/, ""));
    if (!fs.existsSync(publicAsset)) {
      fail(`${relativeLabel(file)} links to missing public file ${targetPath}.`);
    }
  } else if (!routes.has(targetPath)) {
    fail(`${relativeLabel(file)} links to missing route ${targetPath}.`);
  }

  if (parsed.hash && routes.has(targetPath)) {
    const fragment = decodeURIComponent(parsed.hash.slice(1));
    const targetIds = idsByRoute.get(targetPath);
    if (targetIds && !targetIds.has(fragment) && !globalIds.has(fragment)) {
      fail(`${relativeLabel(file)} links to missing fragment ${targetPath}#${fragment}.`);
    }
  }
}

function assertSource(relativePath, pattern, message) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath) || !pattern.test(fs.readFileSync(fullPath, "utf8"))) {
    fail(message);
  }
}

assertSource("src/app/layout.tsx", /<html[\s\S]*lang=["']en["']/, "Root layout must declare html lang=\"en\".");
assertSource("src/app/layout.tsx", /metadataBase\s*:\s*new URL\(siteUrl\)/, "Root metadata must declare metadataBase.");
assertSource("src/app/layout.tsx", /TravelAgency/, "Root layout must include TravelAgency structured data.");
assertSource("src/app/layout.tsx", /WebSite/, "Root layout must include WebSite structured data.");
assertSource("src/app/layout.tsx", /href=["']#main-content["']/, "Root layout must include a skip link.");
assertSource("src/app/robots.ts", /sitemap\s*:/, "robots.ts must advertise the sitemap.");
assertSource("src/app/sitemap.ts", /publicRoutes/, "sitemap.ts must use the shared public route registry.");
assertSource("src/app/not-found.tsx", /export\s+default\s+function\s+NotFound/, "A custom App Router not-found page is required.");
assertSource("src/app/not-found.tsx", /index\s*:\s*false/, "The custom not-found page must be noindex.");

const requiredAssets = [
  "src/app/favicon.ico",
  "src/app/icon.png",
  "src/app/apple-icon.png",
  "public/images/wild-spine-favicon-48.png",
  "public/images/wild-spine-logo.png",
];

for (const asset of requiredAssets) {
  if (!fs.existsSync(path.join(root, asset))) {
    fail(`Required brand asset is missing: ${asset}.`);
  }
}

function pngDimensions(relativePath) {
  const data = fs.readFileSync(path.join(root, relativePath));
  if (data.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
    return undefined;
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const expectedPngSizes = new Map([
  ["src/app/icon.png", [192, 192]],
  ["src/app/apple-icon.png", [180, 180]],
  ["public/images/wild-spine-favicon-48.png", [48, 48]],
]);

for (const [asset, [expectedWidth, expectedHeight]] of expectedPngSizes) {
  if (!fs.existsSync(path.join(root, asset))) {
    continue;
  }

  const dimensions = pngDimensions(asset);
  if (!dimensions || dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
    fail(`${asset} must be ${expectedWidth}x${expectedHeight}.`);
  }
}

const noIndexLayouts = [
  "src/app/admin/layout.tsx",
  "src/app/login/layout.tsx",
  "src/app/reset-password/layout.tsx",
  "src/app/payment/layout.tsx",
  "src/app/thank-you/layout.tsx",
];

for (const layout of noIndexLayouts) {
  assertSource(layout, /noIndexMetadata/, `${layout} must explicitly declare noindex metadata.`);
}

notes.push(`${routes.size} App Router pages discovered`);
notes.push(`${publicRoutes.length} sitemap routes verified`);
notes.push(`${internalLinkCount} internal link targets checked`);
notes.push(`${assetReferenceCount} local asset references checked`);
notes.push(`${imageCount} image elements checked for alt text`);

if (failures.length) {
  console.error("Site audit failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Site audit passed:");
  for (const note of notes) {
    console.log(`- ${note}`);
  }
}

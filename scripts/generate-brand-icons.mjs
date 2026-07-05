import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourcePath =
  process.argv[2] ||
  "C:\\Users\\Yoga\\AppData\\Local\\Temp\\codex-clipboard-b5dcdb62-73ab-42b1-8e6c-0962e72b7bdf.png";

const appDirectory = path.join(projectRoot, "src", "app");
const publicImagesDirectory = path.join(projectRoot, "public", "images");
const fullLogoPath = path.join(publicImagesDirectory, "wild-spine-logo.png");

await fs.mkdir(publicImagesDirectory, { recursive: true });
await fs.copyFile(sourcePath, fullLogoPath);

const sourceEmblem = sharp(sourcePath).extract({
  left: 170,
  top: 65,
  width: 900,
  height: 720,
});

async function roundel(size) {
  const emblemWidth = Math.round(size * 0.94);
  const emblemHeight = Math.round((emblemWidth * 720) / 900);
  const emblem = await sourceEmblem
    .clone()
    .resize({
      width: emblemWidth,
      height: emblemHeight,
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const circle = Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - Math.max(1, size * 0.015)}" fill="#ffffff"/>
    </svg>`,
  );

  const top = Math.round((size - emblemHeight) / 2);
  const left = Math.round((size - emblemWidth) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      { input: circle, top: 0, left: 0 },
      { input: emblem, top, left },
      { input: circle, top: 0, left: 0, blend: "dest-in" },
    ])
    .png()
    .toBuffer();
}

const icon192 = await roundel(192);
const icon180 = await roundel(180);
const faviconPng = await roundel(48);
const faviconSizes = [16, 32, 48, 256];
const faviconImages = await Promise.all(faviconSizes.map((size) => roundel(size)));

await Promise.all([
  fs.writeFile(path.join(appDirectory, "icon.png"), icon192),
  fs.writeFile(path.join(appDirectory, "apple-icon.png"), icon180),
  fs.writeFile(path.join(publicImagesDirectory, "wild-spine-favicon-48.png"), faviconPng),
  fs.writeFile(path.join(appDirectory, "favicon.ico"), createIco(faviconSizes, faviconImages)),
]);

function createIco(sizes, images) {
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * images.length;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(entrySize * images.length);
  let offset = dataOffset;

  images.forEach((image, index) => {
    const size = sizes[index];
    const entryOffset = index * entrySize;
    entries.writeUInt8(size >= 256 ? 0 : size, entryOffset);
    entries.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
    entries.writeUInt8(0, entryOffset + 2);
    entries.writeUInt8(0, entryOffset + 3);
    entries.writeUInt16LE(1, entryOffset + 4);
    entries.writeUInt16LE(32, entryOffset + 6);
    entries.writeUInt32LE(image.length, entryOffset + 8);
    entries.writeUInt32LE(offset, entryOffset + 12);
    offset += image.length;
  });

  return Buffer.concat([header, entries, ...images]);
}

console.log("Generated Wild Spine favicon, app icon, Apple icon, and structured brand logo.");

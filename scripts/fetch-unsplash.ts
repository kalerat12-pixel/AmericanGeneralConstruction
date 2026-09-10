/**
 * Swaps the generated placeholder plates for real Unsplash photography.
 *
 * The session that built this site had no egress to images.unsplash.com, so
 * `npm run gen:assets` synthesised every plate instead. Run this anywhere the
 * host is reachable and the real frames drop into the same filenames — no
 * component or data change needed.
 *
 *   UNSPLASH_ACCESS_KEY=... npm run fetch:photos
 *
 * The access key is optional: without it the script downloads the public CDN
 * URLs recorded below. With it, the script also fires Unsplash's download
 * endpoint, which is what their API guidelines ask integrations to do.
 *
 * Every entry here is mirrored in CREDITS.md. Edit them together.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export interface PhotoSpec {
  /** Output file in /public/images (or /public/textures for textures: true). */
  file: string;
  /** Unsplash photo id — the trailing segment of the photo page URL. */
  id: string;
  photographer: string;
  photographerUrl: string;
  pageUrl: string;
  /** Search term the frame was chosen against. */
  mood: string;
  width: number;
  height: number;
  textures?: boolean;
}

/**
 * Curated against the brief's search terms: marble texture, carrara marble,
 * travertine, mediterranean coast, linen texture, minimal spa interior,
 * sunlight on stone, calm water.
 */
export const PHOTOS: PhotoSpec[] = [
  {
    file: 'hero-coast.jpg',
    id: 'ln5drpv_ImI',
    photographer: 'Sven Wilhelm',
    photographerUrl: 'https://unsplash.com/@sven_wilhelm',
    pageUrl: 'https://unsplash.com/photos/ln5drpv_ImI',
    mood: 'mediterranean coast',
    width: 2560,
    height: 1440,
  },
  {
    file: 'hero-marble.jpg',
    id: 'wLiP1ZaCG7g',
    photographer: 'Scott Webb',
    photographerUrl: 'https://unsplash.com/@scottwebb',
    pageUrl: 'https://unsplash.com/photos/wLiP1ZaCG7g',
    mood: 'carrara marble',
    width: 2400,
    height: 1500,
  },
  {
    file: 'calm-water.jpg',
    id: 'YFEWnPMFJDg',
    photographer: 'Silas Baisch',
    photographerUrl: 'https://unsplash.com/@silasbaisch',
    pageUrl: 'https://unsplash.com/photos/YFEWnPMFJDg',
    mood: 'calm water',
    width: 1800,
    height: 1200,
  },
  {
    file: 'sunlight-on-stone.jpg',
    id: 'Wpnoqo2plFA',
    photographer: 'Anthony DELANOIX',
    photographerUrl: 'https://unsplash.com/@anthonydelanoix',
    pageUrl: 'https://unsplash.com/photos/Wpnoqo2plFA',
    mood: 'sunlight on stone',
    width: 1800,
    height: 1200,
  },
  {
    file: 'spa-interior.jpg',
    id: 'AQl-J19ocWE',
    photographer: 'Jason Wang',
    photographerUrl: 'https://unsplash.com/@jasonw',
    pageUrl: 'https://unsplash.com/photos/AQl-J19ocWE',
    mood: 'minimal spa interior',
    width: 1400,
    height: 1750,
  },
  {
    file: 'daylight-plaster.jpg',
    id: 'IYfp2Ixe9nM',
    photographer: 'Karsten Winegeart',
    photographerUrl: 'https://unsplash.com/@karsten116',
    pageUrl: 'https://unsplash.com/photos/IYfp2Ixe9nM',
    mood: 'minimal spa interior',
    width: 1800,
    height: 1200,
  },
  {
    file: 'travertine-wall.jpg',
    id: 'aQYgUYwnCsM',
    photographer: 'Annie Spratt',
    photographerUrl: 'https://unsplash.com/@anniespratt',
    pageUrl: 'https://unsplash.com/photos/aQYgUYwnCsM',
    mood: 'travertine',
    width: 1800,
    height: 1200,
  },
  {
    file: 'marble-dark.jpg',
    id: 'Z6BEJnI4vOw',
    photographer: 'Dan Cristian Pădureț',
    photographerUrl: 'https://unsplash.com/@dancristianpaduret',
    pageUrl: 'https://unsplash.com/photos/Z6BEJnI4vOw',
    mood: 'marble texture',
    width: 2400,
    height: 1200,
  },
  {
    file: 'linen-fold.jpg',
    id: 'eqW1MPinEV4',
    photographer: 'Nathan Dumlao',
    photographerUrl: 'https://unsplash.com/@nate_dumlao',
    pageUrl: 'https://unsplash.com/photos/eqW1MPinEV4',
    mood: 'linen texture',
    width: 1600,
    height: 1100,
  },
  {
    file: 'coast-band.jpg',
    id: 'sMEMOkNsJDs',
    photographer: 'Thomas Vimare',
    photographerUrl: 'https://unsplash.com/@thomasvimare',
    pageUrl: 'https://unsplash.com/photos/sMEMOkNsJDs',
    mood: 'mediterranean coast',
    width: 2400,
    height: 900,
  },
  {
    file: 'carrara-marble.jpg',
    id: 'gpKe3hMwSFI',
    photographer: 'Kelly Sikkema',
    photographerUrl: 'https://unsplash.com/@kellysikkema',
    pageUrl: 'https://unsplash.com/photos/gpKe3hMwSFI',
    mood: 'carrara marble',
    width: 1400,
    height: 1400,
    textures: true,
  },
  {
    file: 'travertine.jpg',
    id: 'p_9JZBmCSNM',
    photographer: 'Ricardo Gomez Angel',
    photographerUrl: 'https://unsplash.com/@rgaleriacom',
    pageUrl: 'https://unsplash.com/photos/p_9JZBmCSNM',
    mood: 'travertine',
    width: 1400,
    height: 1400,
    textures: true,
  },
  {
    file: 'linen.jpg',
    id: 'gEXasgLNXvE',
    photographer: 'Jeremy Bishop',
    photographerUrl: 'https://unsplash.com/@jeremybishop',
    pageUrl: 'https://unsplash.com/photos/gEXasgLNXvE',
    mood: 'linen texture',
    width: 900,
    height: 900,
    textures: true,
  },
];

const KEY = process.env.UNSPLASH_ACCESS_KEY;

async function main() {
  const root = process.cwd();
  let ok = 0;

  for (const p of PHOTOS) {
    const dir = path.join(root, 'public', p.textures ? 'textures' : 'images');
    const out = path.join(dir, p.file);
    fs.mkdirSync(dir, { recursive: true });

    try {
      // With a key, resolve through the API so the download event is counted.
      let source = `https://source.unsplash.com/${p.id}/${p.width}x${p.height}`;
      if (KEY) {
        const meta = await fetch(`https://api.unsplash.com/photos/${p.id}`, {
          headers: { Authorization: `Client-ID ${KEY}` },
        });
        if (!meta.ok) throw new Error(`API ${meta.status}`);
        const json = (await meta.json()) as {
          urls: { raw: string };
          links: { download_location: string };
        };
        source = `${json.urls.raw}&w=${p.width}&q=85&fm=jpg&fit=crop`;
        // Unsplash asks integrations to hit this endpoint on download.
        await fetch(json.links.download_location, {
          headers: { Authorization: `Client-ID ${KEY}` },
        });
      }

      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());

      await sharp(buf)
        .resize(p.width, p.height, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 84, mozjpeg: true })
        .toFile(out);

      console.log('  ✓', path.relative(root, out), `— ${p.photographer}`);
      ok++;
    } catch (err) {
      console.error('  ✗', p.file, '—', (err as Error).message);
    }
  }

  console.log(`\n${ok}/${PHOTOS.length} downloaded.`);
  if (ok > 0) {
    console.log('Now run:  npm run gen:blur    (regenerates the blur placeholders)');
  }
}

main();

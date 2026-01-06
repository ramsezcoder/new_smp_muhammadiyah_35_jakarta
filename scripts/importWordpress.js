import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DEFAULT_XML_PATH = path.resolve(
  ROOT_DIR,
  'wordpress_import/officialweb-smpmuhammadiyah35jakarta.WordPress.2026-01-06.xml'
);
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'src/data/importedPosts.json');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: false,
  textNodeName: 'text',
  cdataPropName: 'cdata',
  trimValues: false,
  processEntities: false
});

const log = (...args) => console.log('[import:wp]', ...args);

const slugify = (value, fallbackId) => {
  const base = (value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '') || fallbackId || '';
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 75)
    .replace(/(^-|-$)/g, '');
  return slug || `post-${fallbackId || Date.now()}`;
};

const getValue = (input) => {
  if (input == null) return '';
  if (typeof input === 'string' || typeof input === 'number') return String(input).trim();
  if (typeof input === 'object') {
    if (input.cdata != null) return String(input.cdata).trim();
    if (input.text != null) return String(input.text).trim();
    if (input['#text'] != null) return String(input['#text']).trim();
  }
  return '';
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const extractFirstImage = (html) => {
  if (!html) return '';
  const match = html.match(/<img[^>]+src=["']([^"'>\s]+)["']/i);
  return match?.[1] || '';
};

const computeReadTime = (html) => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.min(15, Math.round(words / 200) || 2));
};

const parseDate = (value) => {
  if (!value) return null;
  const isoCandidate = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  const date = new Date(isoCandidate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const loadExisting = () => {
  if (!fs.existsSync(OUTPUT_PATH)) return [];
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    log('Warning: failed to read existing JSON, starting fresh.', err.message);
    return [];
  }
};

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

const extractMeta = (item) => {
  const metaEntries = ensureArray(item['wp:postmeta']);
  const meta = {};
  metaEntries.forEach((entry) => {
    const key = entry?.['wp:meta_key'];
    const val = entry?.['wp:meta_value'];
    if (key) meta[key] = getValue(val);
  });
  return meta;
};

const extractTaxonomies = (item) => {
  const categoriesRaw = ensureArray(item.category);
  const categories = [];
  const tags = [];
  categoriesRaw.forEach((cat) => {
    if (!cat) return;
    const domain = cat?.['@_domain'] || cat?.domain;
    const label = getValue(cat);
    if (domain === 'category') categories.push(label.trim());
    if (domain === 'post_tag') tags.push(label.trim());
  });
  return { categories: categories.filter(Boolean), tags: tags.filter(Boolean) };
};

const buildSeo = ({ meta, title, excerpt, slug }) => {
  const keywords = new Set();
  const focus = meta._yoast_wpseo_focuskw || meta._yoast_wpseo_focuskeywords || meta.seo_focuskw;
  const metaKeywords = meta._yoast_wpseo_metakeywords || meta.metakeywords;
  if (focus) focus.split(',').forEach((k) => {
    const val = k.trim();
    if (val) keywords.add(val);
  });
  if (metaKeywords) metaKeywords.split(',').forEach((k) => {
    const val = k.trim();
    if (val) keywords.add(val);
  });

  const description = meta._yoast_wpseo_metadesc || meta.seo_description || excerpt || title;
  const seoTitle = meta._yoast_wpseo_title || meta.seo_title || title;

  return {
    title: seoTitle?.replace(/\s+/g, ' ').trim() || title,
    description: description?.replace(/\s+/g, ' ').trim() || excerpt || title,
    keywords: Array.from(keywords).filter(Boolean).slice(0, 12),
    slug
  };
};

const mapPost = (item, attachmentMap) => {
  const postType = getValue(item?.['wp:post_type']);
  const status = getValue(item?.['wp:status']);
  if (postType !== 'post') return { skip: true, reason: `skip type ${postType}` };
  if (status !== 'publish') return { skip: true, reason: `skip status ${status}` };

  const id = getValue(item?.['wp:post_id']) || getValue(item?.guid) || Date.now();
  const title = getValue(item?.title);
  const slug = slugify(getValue(item?.['wp:post_name']) || title, id);
  const content = getValue(item?.['content:encoded']);
  const excerpt = getValue(item?.['excerpt:encoded']);
  const meta = extractMeta(item);
  const { categories, tags } = extractTaxonomies(item);
  const createdAt = parseDate(getValue(item?.['wp:post_date']));
  const updatedAt = parseDate(getValue(item?.['wp:post_date_gmt'] || item?.['wp:post_modified'])) || createdAt;
  const thumbId = meta._thumbnail_id;
  const featuredFromMeta = meta._yoast_wpseo_opengraph_image || meta._yoast_wpseo_twitter_image || meta.seo_image;
  const thumbnailUrl = thumbId && attachmentMap.get(thumbId);
  const firstImage = extractFirstImage(content);
  const featuredImage = (featuredFromMeta || thumbnailUrl || firstImage || '').trim();

  const seo = buildSeo({ meta, title, excerpt, slug });
  const finalExcerpt = excerpt?.trim() || stripHtml(content).slice(0, 240);

  return {
    id: String(id),
    title,
    slug,
    content,
    excerpt: finalExcerpt,
    featuredImage,
    category: categories[0] || 'Berita',
    tags,
    createdDate: createdAt ? createdAt.toISOString().slice(0, 10) : null,
    updatedDate: updatedAt ? updatedAt.toISOString().slice(0, 10) : null,
    status: 'published',
    seo,
    readTime: computeReadTime(content)
  };
};

const mergeBySlug = (existing, incoming) => {
  const map = new Map();
  existing.forEach((item) => {
    if (!item?.slug) return;
    map.set(item.slug, item);
  });
  incoming.forEach((item) => {
    if (!item?.slug) return;
    const prev = map.get(item.slug);
    map.set(item.slug, prev ? { ...prev, ...item } : item);
  });
  return Array.from(map.values());
};

const main = () => {
  const xmlPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_XML_PATH;
  if (!fs.existsSync(xmlPath)) {
    console.error(`[import:wp] XML not found at ${xmlPath}`);
    process.exit(1);
  }

  log(`Reading XML from ${xmlPath}`);
  const xmlContent = fs.readFileSync(xmlPath, 'utf8');
  const parsed = parser.parse(xmlContent);
  const items = parsed?.rss?.channel?.item || [];
  const normalizedItems = Array.isArray(items) ? items : [items];

  const attachments = new Map();
  normalizedItems.forEach((item) => {
    const type = getValue(item?.['wp:post_type']);
    if (type === 'attachment') {
      const mime = getValue(item?.['wp:post_mime_type']);
      const id = getValue(item?.['wp:post_id']);
      const url = getValue(item?.guid) || getValue(item?.link);
      if (mime?.startsWith('image') && id && url) {
        attachments.set(id, url);
      }
    }
  });

  const results = [];
  const skipped = [];
  normalizedItems.forEach((item) => {
    const mapped = mapPost(item, attachments);
    if (mapped?.skip) {
      skipped.push(mapped.reason || 'skip');
      return;
    }
    results.push(mapped);
  });

  const existing = loadExisting();
  const merged = mergeBySlug(existing, results);
  const sorted = merged.sort((a, b) => {
    const aDate = a.createdDate || a.updatedDate || '0000-00-00';
    const bDate = b.createdDate || b.updatedDate || '0000-00-00';
    return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
  });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2), 'utf8');

  log(`Imported ${results.length} posts (${sorted.length} total after merge).`);
  if (skipped.length) log(`Skipped ${skipped.length} items:`, skipped.slice(0, 5).join('; ') + (skipped.length > 5 ? '...' : ''));
  log(`Output written to ${OUTPUT_PATH}`);
};

main();

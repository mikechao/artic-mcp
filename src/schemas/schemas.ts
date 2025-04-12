import z from 'zod';

export const paginationSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  total_pages: z.number(),
  current_page: z.number(),
});

// Thumbnail schema
export const thumbnailSchema = z.object({
  lqip: z.string(),
  width: z.number(),
  height: z.number(),
  alt_text: z.string(),
});

// Artwork schema
export const artworkSchema = z.object({
  _score: z.number(),
  id: z.number(),
  api_model: z.string(),
  api_link: z.string(),
  is_boosted: z.boolean(),
  title: z.string(),
  thumbnail: thumbnailSchema,
  timestamp: z.string(),
});

// API Info schema
export const apiInfoSchema = z.object({
  license_text: z.string(),
  license_links: z.array(z.string()),
  version: z.string(),
});

// API Config schema
export const apiConfigSchema = z.object({
  iiif_url: z.string(),
  website_url: z.string(),
});

// Artwork Search Response schema
export const artworkSearchResponseSchema = z.object({
  preference: z.string().nullable(),
  pagination: paginationSchema,
  data: z.array(artworkSchema),
  info: apiInfoSchema,
  config: apiConfigSchema,
});

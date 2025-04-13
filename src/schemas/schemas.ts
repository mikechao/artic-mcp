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

/**
 * Artwork Search Response schema
 * https://api.artic.edu/api/v1/artworks/search
 */
export const artworkSearchResponseSchema = z.object({
  preference: z.string().nullable(),
  pagination: paginationSchema,
  data: z.array(z.object({
    _score: z.number(),
    id: z.number(),
    api_model: z.string(),
    api_link: z.string(),
    is_boosted: z.boolean(),
    title: z.string(),
    thumbnail: thumbnailSchema.nullable(),
    timestamp: z.string(),
  })),
  info: apiInfoSchema,
  config: apiConfigSchema,
});

/**
 * https://api.artic.edu/api/v1/artworks/{artwork_id}?fields=artworkSchema.keys()
 *
 *
 */
export const artworkSchema = z.object({
  id: z.number(),
  title: z.string(),
  alt_titles: z.array(z.string()).nullable(),
  thumbnail: thumbnailSchema,
  artist_display: z.string(),
  place_of_origin: z.string(),
  description: z.string().nullable(),
  dimensions: z.string(),
  medium_display: z.string(),
  credit_line: z.string(),
  is_on_view: z.boolean(),
  department_title: z.string(),
  artist_id: z.number(),
  image_id: z.string(),
});

export const artworkResponseSchema = z.object({
  data: artworkSchema,
  info: apiInfoSchema,
  config: apiConfigSchema,
});

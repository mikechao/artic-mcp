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
  main_reference_number: z.string(),
  has_not_been_viewed_much: z.boolean(),
  date_start: z.number().nullable(),
  date_end: z.number().nullable(),
  date_display: z.string().nullable(),
  artist_display: z.string(),
  place_of_origin: z.string(),
  description: z.string().nullable(),
  dimensions: z.string(),
  medium_display: z.string(),
  credit_line: z.string(),
  fiscal_year: z.number().nullable(),
  is_public_domain: z.boolean(),
  gallery_title: z.string().nullable(),
  artwork_type_title: z.string(),
  is_on_view: z.boolean(),
  department_title: z.string(),
  artist_title: z.string(),
  artist_titles: z.array(z.string()),
  style_title: z.string().nullable(),
  artist_id: z.number(),
  image_id: z.string(),
});

export const artworkResponseSchema = z.object({
  data: artworkSchema,
  info: apiInfoSchema,
  config: apiConfigSchema,
});

/**
 * https://api.artic.edu/api/v1/agents/search?limit=10&page=1
 */
export const artistSearchResponseSchema = z.object({
  preference: z.string().nullable(),
  pagination: paginationSchema,
  data: z.array(z.object({
    _score: z.number(),
    id: z.number(),
    api_model: z.string(),
    api_link: z.string(),
    title: z.string(),
    timestamp: z.string(),
  })),
  info: apiInfoSchema,
  config: apiConfigSchema,
});

[![artic-logo](https://raw.githubusercontent.com/Art-Institute-of-Chicago/template/main/aic-logo.gif)](https://www.artic.edu/)

# Art Institute of Chicago MCP Server

A Model Context Protocol (MCP) server that provides access to the [Art Institute of Chicago Collection](https://www.artic.edu/collection) through natural language interactions. This server allows AI models to search the art collection at the Art Institute of Chicago and have artworks available as a Resource.

## Features

This server provides AI models with the following tools for interacting with the art collection.

### 1. Search By Title (search-by-title)

Search for artworks by title in the Art Institute of Chicago

- Inputs:
  - `title` (string) The title of the artwork to search for.
  - `limit` (number, optional, default 10) The number of resources to return per page.
  - `page` (number, optional, default 1) The page of results to return. Used for pagination.
- Outputs:

  ```
  Title: Nighthawks
  Artwork ID: 111628
  Thumbnail alt text: Scene in a diner, viewed through wrap-around glass windows, at night on an empty urban street. A light-skinned man and woman, he in a suit and she in a red dress, sit together at a triangular wood bar, eyes downcast. At left sits another man, his back to the viewer. Behind the counter is a light-skinned man in a white uniform. The interior lights cast a yellow glow that spills onto the street in pale green. Above the diner a sign reads, "Phillies."
  Score: 1055.3839

  -----
  Title: Nighthawks
  Artwork ID: 118165
  Thumbnail alt text: A work made of chromogenic print.
  Score: 57.28689

  Pagination Info
  Total: 2
  Total Pages: 1
  Current Page: 1
  ```

### 2. Get a specific artwork (get-artwork-by-id)

Gets additional information, including the image if available, for a piece of art based on it's id.

- Inputs:
  - `id` (number) The ID of the artwork to retrieve.
- Outputs:

  ```
  Title: Nighthawks
  Artist: Edward Hopper (American, 1882–1967)
  Artist ID: 34996
  Description: <p>About <em>Nighthawks</em> Edward Hopper recollected, “unconsciously, probably, I was painting the loneliness of a large city.” In an all-night diner, three customers sit at the counter opposite a server, each appear to be lost in thought and disengaged from one another. The composition is tightly organized and spare in details: there is no entrance to the establishment, no debris on the streets. Through harmonious geometric forms and the glow of the diner’s electric lighting, Hopper created a serene, beautiful, yet enigmatic scene. Although inspired by a restaurant Hopper had seen on Greenwich Avenue in New York, the painting is not a realistic transcription of an actual place. As viewers, we are left to wonder about the figures, their relationships, and this imagined world.</p>

  Image ID: 831a05de-d3f6-f4fa-a460-23008dd58dda
  Place of Origin: United States
  Dimensions: 84.1 × 152.4 cm (33 1/8 × 60 in.)
  Medium: Oil on canvas
  Credit Line: Friends of American Art Collection
  Department: Arts of the Americas
  Is On View: Yes
  Main Reference Number: 1942.51
  Has not been viewed much: No
  Date Start: 1942
  Date End: 1942
  Date: 1942
  Fiscal Year: 1942
  Is Public Domain: No
  Gallery: Gallery 262
  Artwork Type: Painting
  Artist Title: Edward Hopper
  Artist Titles: Edward Hopper
  Style Title: Modernism

  ```

  ```
  **image encoded in base64 if available
  ```

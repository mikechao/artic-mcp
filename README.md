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

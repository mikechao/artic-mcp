[![artic-logo](https://raw.githubusercontent.com/Art-Institute-of-Chicago/template/main/aic-logo.gif)](https://www.artic.edu/)
<br/>
[![smithery badge](https://smithery.ai/badge/@mikechao/artic-mcp)](https://smithery.ai/server/@mikechao/artic-mcp)

<a href="https://glama.ai/mcp/servers/@mikechao/artic-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@mikechao/artic-mcp/badge" alt="artic-mcp MCP server" />
</a>

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

### 3. Full text search (full-text-search)

Performs a full text search of artworks whose metadata contains the search query.

- Inputs:
  - `query` (string) The term to search the metadata for.
  - `limit` (number, optional, default 10) The number of resources to return per page.
  - `page` (number, optional, default 1) The page of results to return. Used for pagination.
- Outputs:

  ```
  Title: Untitled
  Artwork ID: 62290
  Thumbnail alt text: A work made of oil and enamel on paper, mounted on composition board.
  Score: 108.70728

  -----
  ...
  ...
  -----
  Title: Homage to the Square: Light Passage
  Artwork ID: 5569
  Thumbnail alt text: Painting of overlapping squares in grey, yellow, gold, and orange.
  Score: 104.18398

  Pagination Info
  Total: 8399
  Total Pages: 840
  Current Page: 1
  ```

### 4. Artist search (search-for-artist)

Search for a specific artist

- Inputs:
  - `name` (string) The name of the artist to search for.
  - `limit` (number, optional, default 10) The number of resources to return per page.
  - `page` (number, optional, default 1) The page of results to return. Used for pagination.
- Outputs:

  ```
  Title: Vincent van Gogh
  Artist ID: 40610
  Score: 55.865852

  -----
  Title: Imitator of Vincent van Gogh
  Artist ID: 47301
  Score: 48.782307

  Pagination Info
  Total: 2
  Total Pages: 1
  Current Page: 1
  ```

### 5. Find artwork by artist (get-artwork-by-artist)

Find works fo art by an artist

- Inputs:
  - `id` (number) The id of the artist to search for artworks. Should be the Artist ID of the `search-for-artist` tool.
  - `limit` (number, optional, default 10) The number of resources to return per page.
  - `page` (number, optional, default 1) The page of results to return. Used for pagination.
- Outputs:

  ```
  Title: The Bedroom
  Artwork ID: 28560
  Thumbnail alt text: Painting of bedroom, blue walls, green window, tan bed, red bedding.
  Score: 11473.843

  -----
  .
  .
  .
  -----
  Title: Weeping Tree
  Artwork ID: 52733
  Thumbnail alt text: A work made of reed pen and black-brown ink, with black chalk on off-white wove paper.
  Score: 11.8061

  Pagination Info
  Total: 18
  Total Pages: 2
  Current Page: 1
  ```

## Usage

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcp-servers": {
    "artic-museum": {
      "command": "npx",
      "args": [
        "-y",
        "artic-mcp"
      ]
    }
  }
}
```

## Installing via Smithery

To install artic-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@mikechao/artic-mcp):

```bash
npx -y @smithery/cli install @mikechao/artic-mcp --client claude
```

## Example queries

Here some questions you can ask the AI model when this server in connected:

```
Can you show me the painting titled "Nighthawks"?
Can you find art done by Vincent van Gogh in 1890 that is on display?
Can you find art by the artist Jackson Pollock?
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## Disclaimer

This MCP Server is not officially associated with The Art Institute of Chicago. It is a third-party implementation of the [The Art Institute of Chicago's API](https://api.artic.edu/docs/) with a MCP Server.
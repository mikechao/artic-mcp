export default {
  async fetch(request: Request): Promise<Response> {
    const resp = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments');
    const text = await resp.text();
    return new Response(text, { status: resp.status });
  },
};

// /functions/_middleware.js
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.includes('.')) return next();

  const jsonURL = new URL(path.endsWith('/') ? `index.json` : `../index.json`, url);
  const jsonReq = new Request(jsonURL, request);

  try {
    const res = await env.ASSETS.fetch(jsonReq);
    if (res.status === 200) {
      const newRes = new Response(res.body, res);
      newRes.headers.set('Content-Type', 'application/json');
      return newRes;
    }
  } catch {}

  return next();
}

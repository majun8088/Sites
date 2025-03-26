// /functions/_middleware.js
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 跳过带后缀的请求（如图片/CSS/JS）
  if (path.includes('.')) return next();

  // 强制路径以斜杠结尾
  if (!path.endsWith('/')) {
    return Response.redirect(`${url.href}/`, 301);
  }

  // 构造 index.json 路径
  const jsonURL = new URL(`index.json`, url);
  const jsonReq = new Request(jsonURL, request);

  try {
    const res = await env.ASSETS.fetch(jsonReq);
    if (res.status === 200) {
      const newRes = new Response(res.body, res);
      newRes.headers.set('Content-Type', 'application/json');
      newRes.headers.set('Cache-Control', 'no-store, max-age=0');
      newRes.headers.set('X-Middleware-Triggered', 'true'); // 调试头
      return newRes;
    }
  } catch (e) {
    console.error(e);
  }

  return next();
}

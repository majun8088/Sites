// /functions/_middleware.js
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 强制路径以斜杠结尾（适配 TVBox）
  if (!path.endsWith('/')) {
    return Response.redirect(`${url.href}/`, 301);
  }

  // 跳过带后缀的请求
  if (path.includes('.')) return next();

  // 构造 index.json 路径
  const jsonURL = new URL(`index.json`, url);
  const jsonReq = new Request(jsonURL, request);

  try {
    const res = await env.ASSETS.fetch(jsonReq);
    if (res.status === 200) {
      const newRes = new Response(res.body, res);
      // 设置关键响应头
      newRes.headers.set('Content-Type', 'application/json');
      newRes.headers.set('Cache-Control', 'no-store, max-age=0');
      newRes.headers.set('Access-Control-Allow-Origin', '*'); // 允许跨域
      newRes.headers.set('X-Middleware-Debug', 'tvbox-fix'); // 调试标记
      return newRes;
    }
  } catch (e) {
    console.error('Middleware Error:', e);
  }

  return next();
}

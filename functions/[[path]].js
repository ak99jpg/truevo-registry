// functions/[[path]].js
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Serve static files directly
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|json|txt|svg|woff|woff2)$/)) {
    return next();
  }
  
  // Serve _next files directly
  if (url.pathname.startsWith('/_next/')) {
    return next();
  }
  
  // For API routes
  if (url.pathname.startsWith('/api/')) {
    return next();
  }
  
  // For all other routes, rewrite to index.html
  return next('/');
}
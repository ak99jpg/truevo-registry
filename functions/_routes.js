// functions/_routes.js
export async function onRequest(context) {
  const { request, next } = context;
  
  // Clone the request to modify it
  const url = new URL(request.url);
  
  // If the request is for a file that exists (like .css, .js, .png), serve it
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|json|txt)$/)) {
    return next();
  }
  
  // Otherwise, rewrite to index.html for client-side routing
  return next('/');
}
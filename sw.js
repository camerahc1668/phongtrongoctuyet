/* Service Worker — PhòngTrọ Pro. Đổi VERSION mỗi khi cập nhật index.html để máy khách tải bản mới. */
const VERSION='pt-v5-1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const CDN=['cdn.jsdelivr.net','cdnjs.cloudflare.com','unpkg.com','www.gstatic.com','fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Trang cổng khách (portal.html) luôn đi thẳng ra mạng, không lưu cache
  if(url.origin===location.origin&&/portal\.html$/.test(url.pathname))return;
  // Trang chính: ưu tiên mạng (có bản mới thì lấy), mất mạng thì dùng bản đã lưu
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(VERSION).then(c=>c.put('./index.html',cp));return r})
      .catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  // Tệp cùng nguồn + thư viện CDN: dùng bản lưu trước, cập nhật nền
  if(url.origin===location.origin||CDN.includes(url.hostname)){
    e.respondWith(caches.open(VERSION).then(async c=>{
      const hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}).catch(()=>hit);
      return hit||net;
    }));
  }
  // Còn lại (Firebase, VietQR, Storage...) đi thẳng ra mạng
});

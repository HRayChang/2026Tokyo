const C='tokyo-trip-cache',RT='tokyo-runtime-v2',MAXT=3000;
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('tokyo-runtime')&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const EXT=/^cyberjapandata\.gsi\.go\.jp$|^cdnjs\.cloudflare\.com$/;
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(EXT.test(u.hostname)){ /* 地圖圖磚與 Leaflet：快取優先，看過的區域離線也能顯示 */
    e.respondWith(caches.open(RT).then(async c=>{
      const m=await c.match(r.url);if(m)return m;
      try{const res=await fetch(r.url,{mode:'cors'});
        if(res.ok){c.put(r.url,res.clone());c.keys().then(k=>{if(k.length>MAXT)k.slice(0,k.length-MAXT).forEach(x=>c.delete(x))})}
        return res}catch(err){try{return await fetch(r.url,{mode:'no-cors'})}catch(e2){return Response.error()}}}));
    return;
  }
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{
    const copy=res.clone();caches.open(C).then(c=>c.put(r,copy));return res;
  }).catch(()=>caches.match(r)));
});

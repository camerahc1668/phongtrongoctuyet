/* PhòngTrọ — nút "Cài đặt ứng dụng" cho trang khách (portal.html).
   Cách dùng: thêm  <script src="pt-install.js"></script>  ngay trước </body> của portal.html */
(function(){
  if(window.__ptInstall)return;window.__ptInstall=1;
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  if(standalone)return;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent),evt=null,bar=null;
  // Nếu trang chưa có manifest riêng, tạo manifest mở lại đúng trang khách này (giữ mã phòng trong #)
  if(!document.querySelector('link[rel="manifest"]')){
    try{
      var mf={name:'PhòngTrọ - Khách',short_name:'PhòngTrọ',start_url:location.href,scope:location.href.replace(/[^\/]*([?#].*)?$/,''),display:'standalone',background_color:'#ffffff',theme_color:'#16a34a',icons:[{src:new URL('icon-192.png',location.href).href,sizes:'192x192',type:'image/png'},{src:new URL('icon-512.png',location.href).href,sizes:'512x512',type:'image/png'}]};
      var l=document.createElement('link');l.rel='manifest';l.href=URL.createObjectURL(new Blob([JSON.stringify(mf)],{type:'application/manifest+json'}));document.head.appendChild(l);
    }catch(e){}
  }
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();evt=e;});
  window.addEventListener('appinstalled',function(){if(bar)bar.remove();});
  function guide(){
    var m=ios?'Bấm nút Chia sẻ (ô vuông có mũi tên) rồi chọn "Thêm vào MH chính".':'Mở menu trình duyệt (⋮) rồi chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".';
    alert(m);
  }
  function add(){
    bar=document.createElement('div');bar.id='ptInstallBar';
    bar.style.cssText='position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:10px;padding:calc(8px + env(safe-area-inset-top,0px)) 12px 8px;background:#0f766e;color:#fff;font:600 14px/1.3 system-ui,-apple-system,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25)';
    bar.innerHTML='<span style="font-size:20px">📲</span><span style="flex:1">Cài ứng dụng để xem phòng nhanh hơn</span>'
      +'<button id="ptIB" type="button" style="border:0;border-radius:999px;padding:8px 14px;font:700 13px system-ui;background:#fff;color:#0f766e;cursor:pointer">Cài đặt</button>'
      +'<button id="ptIX" type="button" aria-label="Đóng" style="border:0;background:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 6px">✕</button>';
    document.body.insertBefore(bar,document.body.firstChild);
    bar.querySelector('#ptIB').onclick=function(){
      if(evt){evt.prompt();evt.userChoice&&evt.userChoice.then(function(c){if(c.outcome==='accepted')bar.remove();evt=null});}
      else guide();
    };
    bar.querySelector('#ptIX').onclick=function(){bar.remove();try{sessionStorage.setItem('ptInstallHide','1')}catch(e){}};
  }
  function go(){try{if(sessionStorage.getItem('ptInstallHide'))return}catch(e){}add()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();

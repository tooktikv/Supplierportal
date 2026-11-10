// Turns the static export (.next-export/) into a folder that works when index.html is
// opened straight from disk (file://) - no server, no deploy.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const src = path.resolve(".next-export");
const out = path.resolve("prototype");

if (!existsSync(src)) throw new Error("Run `STATIC_EXPORT=1 next build` first.");
rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true });

const shim = (root, route) => `<script>(function(){
var ROOT=${JSON.stringify(root)};
window.__offlinePath=${JSON.stringify(route)};
// Must equal the (relative) src attributes rewritten below: the runtime finds loaded scripts by attribute.
window.TURBOPACK_CHUNK_BASE_PATH=ROOT+"_next/";
var base=window.TURBOPACK_CHUNK_BASE_PATH;
// Flight payload chunk URLs must match the runtime chunk base path exactly.
var flight=self.__next_f=self.__next_f||[];
var push=flight.push;
flight.push=function(){
  var a=arguments[0];
  if(a&&typeof a[1]==="string")a[1]=a[1].split('"/_next/').join('"'+base);
  return push.apply(this,arguments);
};
function toFile(href){
  var u=new URL(href,"http://x");
  var p=u.pathname.replace(/^\\/+|\\/+$/g,"");
  return ROOT+(p?p+"/":"")+"index.html"+u.search+u.hash;
}
window.__offlineNav=function(href,replace){location[replace?"replace":"assign"](toFile(href));};
document.addEventListener("click",function(e){
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target.closest&&e.target.closest("a[href]");
  if(!a||(a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
  var h=a.getAttribute("href");
  if(!h||h[0]!=="/"||h[1]==="/"||/\\.[a-z0-9]+$/i.test(h.split(/[?#]/)[0]))return;
  e.preventDefault();e.stopPropagation();window.__offlineNav(h);
},true);
["pushState","replaceState"].forEach(function(k){
  var orig=history[k];
  history[k]=function(){try{return orig.apply(this,arguments);}catch(err){}};
});
})();</script>`;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

for (const file of walk(out)) {
  if (file.endsWith(".txt")) {
    rmSync(file); // RSC payloads are only fetched by the client router, which is bypassed here
    continue;
  }
  if (!file.endsWith(".html")) continue;
  const rel = path.relative(out, path.dirname(file));
  const depth = rel ? rel.split(path.sep).length : 0;
  const route = "/" + rel.split(path.sep).filter(Boolean).join("/");
  const root = depth ? "../".repeat(depth) : "./";
  let html = readFileSync(file, "utf8");
  html = html.replace(/(src|href)="\/(_next\/[^"]*|icon\.svg)"/g, `$1="${root}$2"`);
  html = html.replace("<head>", `<head>${shim(root, route)}`);
  writeFileSync(file, html);
}

// "/" is a server-side redirect in the app; replace it with a plain redirect to the entry page.
writeFileSync(
  path.join(out, "index.html"),
  '<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=onboarding/index.html"><a href="onboarding/index.html">Open prototype</a>',
);
console.log(`Offline prototype written to ${out}\nOpen ${path.join(out, "index.html")} in a browser.`);

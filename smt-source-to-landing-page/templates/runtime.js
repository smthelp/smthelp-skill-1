/* smt-source-to-landing-page runtime: language, theme, tabs, videos, gallery,
   PDF preview, calculator, enquiry form. No external dependencies.
   The build script replaces the two markers below with JSON. */
/*I18N*/
/*CFG*/
const LANGS = CFG.langs;
const LANG_KEY = CFG.storage+"_lang", THEME_KEY = CFG.storage+"_theme";

/* Wrap left-to-right runs (model codes, dimensions, e-mail) in isolates when the
   string contains right-to-left text, so "12.7 mm" is not reordered in Arabic. */
var RTL_TEXT=/[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
function isolateRuns(s){
  s=String(s);
  if(!RTL_TEXT.test(s)) return s;
  var wrap=function(seg){
    if(!seg) return "";
    var core=seg.trim();
    if(core.length<3||!/[A-Za-z0-9]/.test(core)) return seg;
    var at=seg.indexOf(core);
    return seg.slice(0,at)+"\u2066"+core+"\u2069"+seg.slice(at+core.length);
  };
  var out="",cur="",i,ch;
  for(i=0;i<s.length;i++){
    ch=s.charAt(i);
    if(RTL_TEXT.test(ch)){ out+=wrap(cur); cur=""; out+=ch; }
    else cur+=ch;
  }
  return out+wrap(cur);
}
function T(lang,key){
  var d=I18N[lang]||I18N.en, v=d[key];
  if(v===undefined) v=I18N.en[key];
  return v===undefined?key:v;
}
function fmt(n,lang){
  try{ return new Intl.NumberFormat(lang==="zh"?"zh-CN":lang,{maximumFractionDigits:1}).format(n); }
  catch(e){ return String(Math.round(n*10)/10); }
}
function curLang(){ return document.documentElement.getAttribute("lang")||"en"; }

function applyLang(lang,persist){
  if(!I18N[lang]) lang="en";
  var meta=I18N[lang].__meta, root=document.documentElement;
  root.setAttribute("lang",lang);
  root.setAttribute("dir",meta.dir||"ltr");
  document.querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent=isolateRuns(T(lang,el.getAttribute("data-i18n"))); });
  document.querySelectorAll("[data-i18n-alt]").forEach(function(el){ el.setAttribute("alt",isolateRuns(T(lang,el.getAttribute("data-i18n-alt")))); });
  document.querySelectorAll("[data-i18n-aria]").forEach(function(el){ el.setAttribute("aria-label",isolateRuns(T(lang,el.getAttribute("data-i18n-aria")))); });
  document.querySelectorAll("[data-i18n-title]").forEach(function(el){ el.setAttribute("title",isolateRuns(T(lang,el.getAttribute("data-i18n-title")))); });
  document.title=T(lang,"seo_title");
  var set=function(sel,attr,key){ var m=document.querySelector(sel); if(m) m.setAttribute(attr,T(lang,key)); };
  set('meta[name="description"]',"content","seo_desc");
  set('meta[property="og:title"]',"content","og_title");
  set('meta[property="og:description"]',"content","og_desc");
  set('meta[name="twitter:title"]',"content","og_title");
  set('meta[name="twitter:description"]',"content","og_desc");
  var li=document.getElementById("langIcon"); if(li) li.textContent=meta.short;
  /* Articles: show the visitor's language when a translation exists, else English plus a note. */
  document.querySelectorAll(".post").forEach(function(p){
    var arts=p.querySelectorAll(".art[data-blang]"), has=false;
    arts.forEach(function(a){ if(a.getAttribute("data-blang")===lang) has=true; });
    arts.forEach(function(a){ var bl=a.getAttribute("data-blang"); a.hidden = has ? bl!==lang : bl!=="en"; });
    var n=p.querySelector(".enonly"); if(n) n.hidden = has || lang==="en";
  });
  document.querySelectorAll("#langMenu button").forEach(function(b){ b.setAttribute("aria-current", b.getAttribute("data-lang")===lang?"true":"false"); });
  calc();
  if(persist!==false){ try{ localStorage.setItem(LANG_KEY,lang); }catch(e){} }
}
function applyTheme(mode,persist){
  if(mode!=="dark") mode="light";
  document.documentElement.setAttribute("data-theme",mode);
  var ic=document.getElementById("themeIcon"); if(ic) ic.textContent= mode==="dark" ? "☾" : "☀";
  var mt=document.querySelector('meta[name="theme-color"]'); if(mt) mt.setAttribute("content", mode==="dark" ? CFG.themeDark : CFG.themeLight);
  if(persist!==false){ try{ localStorage.setItem(THEME_KEY,mode); }catch(e){} }
}

/* Calculator: inputs, intermediate vars and outputs come from product.json (calc).
   Every input is the visitor's; nothing is assumed. */
function num(id){ var el=document.getElementById(id); var v=parseFloat(el&&el.value); return isNaN(v)||v<0?0:v; }
var CALC_FN=null;
function calc(){
  var C=CFG.calc; if(!C||!C.outputs||!C.outputs.length) return;
  var lang=curLang();
  if(!CALC_FN){
    var src=C.vars.map(function(p){ return "var "+p[0]+"=("+p[1]+");"; }).join("")+
      "return ["+C.outputs.map(function(o){ return "("+o.expr+")"; }).join(",")+"];";
    CALC_FN=new Function(C.inputs.join(","),src);
  }
  var vals=CALC_FN.apply(null,C.inputs.map(num));
  C.outputs.forEach(function(o,i){
    var el=document.getElementById(o.id), v=vals[i]; if(!el) return;
    var dec=o.decimals||0, p=Math.pow(10,dec);
    el.textContent = v>0 && isFinite(v) ? (dec ? (Math.round(v*p)/p).toLocaleString(lang==="zh"?"zh-CN":lang) : fmt(Math.round(v),lang)) : "\u2014";
  });
}

(function boot(){
  var params=new URLSearchParams(location.search), lang="en", theme=null;
  try{
    lang = params.get("lang") || localStorage.getItem(LANG_KEY) || "en";
    theme = localStorage.getItem(THEME_KEY);
  }catch(e){ lang=params.get("lang")||"en"; }
  if(!I18N[lang]) lang="en";
  if(!theme) theme=(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";
  applyTheme(theme,false);

  var lm=document.getElementById("langMenu");
  lm.innerHTML=LANGS.map(function(c){ var m=I18N[c].__meta; return '<button type="button" role="menuitem" data-lang="'+c+'" lang="'+c+'"><span>'+m.label+'</span><span class="code">'+m.short+'</span></button>'; }).join("");
  document.getElementById("themeBtn").addEventListener("click",function(){
    applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark",true);
  });
  var lw=document.getElementById("langWrap"), lb=document.getElementById("langBtn");
  var closeLang=function(){ lw.classList.remove("open"); lb.setAttribute("aria-expanded","false"); };
  lb.addEventListener("click",function(e){ e.stopPropagation(); var o=lw.classList.toggle("open"); lb.setAttribute("aria-expanded",o?"true":"false"); });
  lm.addEventListener("click",function(e){ var b=e.target.closest("button[data-lang]"); if(!b) return; applyLang(b.getAttribute("data-lang"),true); closeLang(); });
  document.addEventListener("click",closeLang);

  var hdr=document.getElementById("hdr");
  document.getElementById("burger").addEventListener("click",function(){ hdr.classList.toggle("navopen"); });
  document.getElementById("nav").addEventListener("click",function(e){ if(e.target.tagName==="A") hdr.classList.remove("navopen"); });

  /* FAB tabs */
  var tabs=[].slice.call(document.querySelectorAll(".ftab"));
  function selTab(tb){
    tabs.forEach(function(x){ var on=x===tb; x.classList.toggle("on",on); x.setAttribute("aria-selected",on?"true":"false"); x.tabIndex=on?0:-1;
      var p=document.getElementById(x.getAttribute("aria-controls")); p.classList.toggle("on",on); if(on) p.removeAttribute("hidden"); else p.setAttribute("hidden",""); });
  }
  tabs.forEach(function(tb,i){
    tb.tabIndex = i===0?0:-1;
    tb.addEventListener("click",function(){ selTab(tb); });
    tb.addEventListener("keydown",function(e){
      var k=e.key, rtl=document.documentElement.dir==="rtl", n=null;
      if(k==="ArrowRight"||k==="ArrowDown") n=tabs[(i+(rtl&&k==="ArrowRight"?-1:1)+tabs.length)%tabs.length];
      if(k==="ArrowLeft"||k==="ArrowUp") n=tabs[(i+(rtl&&k==="ArrowLeft"?1:-1)+tabs.length)%tabs.length];
      if(n){ e.preventDefault(); selTab(n); n.focus(); }
    });
  });

  /* Videos: click-to-load iframe inside the card; nothing contacts YouTube's player until then. */
  var grid=document.getElementById("vidGrid");
  function playCard(th){
    if(!th || th.querySelector("iframe")) return;
    var id=th.getAttribute("data-vid"), f=document.createElement("iframe");
    f.src="https://www.youtube-nocookie.com/embed/"+id+"?rel=0&autoplay=1";
    f.title=(th.parentNode.querySelector("h3")||{}).textContent||"YouTube video";
    f.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.setAttribute("allowfullscreen","");
    f.loading="lazy";
    th.innerHTML=""; th.appendChild(f); th.classList.add("playing");
  }
  if(grid) grid.addEventListener("click",function(e){ var b=e.target.closest(".pl"); if(b) playCard(b.closest(".th")); });
  document.querySelectorAll(".vchip").forEach(function(c){
    c.addEventListener("click",function(){
      var f=c.getAttribute("data-f");
      document.querySelectorAll(".vchip").forEach(function(x){ x.classList.toggle("on",x===c); x.setAttribute("aria-pressed",x===c?"true":"false"); });
      if(grid) grid.querySelectorAll(".vid").forEach(function(v){ v.hidden = !(f==="all"||v.getAttribute("data-cat")===f); });
    });
  });

  /* Lightbox: the image element has no src until opened (an empty src would request the page). */
  var lbx=document.getElementById("lb"), lbimg=lbx.querySelector("img");
  window.closeLb=function(){ lbx.classList.remove("open"); lbimg.removeAttribute("src"); };
  lbx.addEventListener("click",function(e){ if(e.target!==lbimg) closeLb(); });
  document.querySelectorAll(".galgrid figure").forEach(function(f){
    var open=function(){ var full=f.getAttribute("data-full"); if(!full) return; var im=f.querySelector("img");
      lbimg.setAttribute("alt", im.getAttribute("alt")||""); lbimg.src=full; lbx.classList.add("open"); };
    f.addEventListener("click",open);
    f.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(); } });
  });

  /* PDF preview: iframe gets its src only on demand and loses it on close. */
  var pm=document.getElementById("pdfModal"), pf=document.getElementById("pdfFrame");
  window.closePdf=function(){ pm.classList.remove("open"); pf.removeAttribute("src"); };
  document.getElementById("pdfClose").addEventListener("click",closePdf);
  pm.addEventListener("click",function(e){ if(e.target===pm) closePdf(); });
  document.querySelectorAll("[data-pdf]").forEach(function(b){
    b.addEventListener("click",function(){ pf.src=b.getAttribute("data-pdf"); pm.classList.add("open"); });
  });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ closeLang(); closeLb(); closePdf(); } });

  ((CFG.calc&&CFG.calc.inputs)||[]).forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener("input",calc); });

  /* Enquiry form opens the visitor's own mail client. */
  var qf=document.getElementById("qform");
  if(qf) qf.addEventListener("submit",function(e){
    e.preventDefault();
    var L=curLang();
    var lines=[].map.call(qf.querySelectorAll(".fld"),function(f){
      var lab=f.querySelector("label"), inp=f.querySelector("input,textarea,select");
      return (lab?lab.textContent:"")+": "+((inp&&inp.value)||"").trim();
    }).join("\n");
    location.href="mailto:"+CFG.email+"?subject="+encodeURIComponent(T(L,"f_subject"))+"&body="+encodeURIComponent(lines);
  });

  var tt=document.getElementById("toTop");
  window.addEventListener("scroll",function(){ tt.classList.toggle("show", window.scrollY>900); },{passive:true});
  tt.addEventListener("click",function(){ window.scrollTo({top:0,behavior: matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}); });

  /* Printing: open every article and answer so the paper copy is complete. */
  window.addEventListener("beforeprint",function(){ document.querySelectorAll("details").forEach(function(d){ d.setAttribute("data-was",d.open?"1":"0"); d.open=true; }); });
  window.addEventListener("afterprint",function(){ document.querySelectorAll("details[data-was]").forEach(function(d){ d.open=d.getAttribute("data-was")==="1"; d.removeAttribute("data-was"); }); });

  var reduced=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced){ var hi=document.getElementById("heroImgs"); if(hi) hi.classList.remove("playing"); }

  applyLang(lang,false);
})();

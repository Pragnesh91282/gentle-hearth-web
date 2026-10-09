// Runs before the page paints and marks <html data-app> when Thehrav is open
// as an installed app: a Trusted Web Activity from an app store (its first
// page has an android-app:// referrer), a home-screen install, or the app's
// start URL (?source=app). The mark lasts for the session, so every later
// page keeps the app layout. Styles use the "app:" variant in globals.css.
export const APP_MODE_SCRIPT = `(function(){try{
var q=new URLSearchParams(location.search);
var isApp=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||document.referrer.indexOf("android-app://")===0||q.get("source")==="app";
if(isApp)sessionStorage.setItem("thehrav:app","1");
if(isApp||sessionStorage.getItem("thehrav:app")==="1")document.documentElement.setAttribute("data-app","");
}catch(e){}})();`;

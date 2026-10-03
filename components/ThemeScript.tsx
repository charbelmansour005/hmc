// Dark is the default and is rendered on the server (data-theme="dark" on
// <html>), so it also applies without JavaScript. This runs before first paint
// and only switches to light for visitors who chose light with the toggle.
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

/** Goes in <head>; the <html> element needs suppressHydrationWarning. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

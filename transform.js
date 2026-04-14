const fs = require('fs');
const path = require('path');

const screens = [
  'login', 'freelancers', 'profile', 'feed', 'dashboard', 'subscription'
];

let tailwindConfigExtracted = false;

for (const name of screens) {
  const htmlPath = `stitching/${name}.html`;
  if (!fs.existsSync(htmlPath)) continue;
  
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  if (!tailwindConfigExtracted) {
     const twMatch = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\});/);
     if (twMatch) {
         try {
             // Add quotes to unquoted keys to parse JSON if necessary, or just eval it
             let twObjStr = twMatch[1].replace(/'/g, '"');
             const colorsMatch = html.match(/"colors":\s*(\{[\s\S]*?\n\s*\})/);
             if (colorsMatch) {
                 const colors = JSON.parse(colorsMatch[1]);
                 let themeVars = '\n@theme inline {\n';
                 for (let [k, v] of Object.entries(colors)) {
                     themeVars += `  --color-${k}: ${v};\n`;
                 }
                 themeVars += `  --font-headline: "Manrope";\n  --font-body: "Inter";\n  --font-label: "Inter";\n`;
                 themeVars += '}\n';
                 fs.appendFileSync('src/app/globals.css', themeVars);
                 console.log("Appended colors to globals.css");
                 tailwindConfigExtracted = true;
             }
         } catch(e) {
             console.error("Error extracting tailwind config", e);
         }
     }
     
     // Also extract custom styles
     const styleMatch = html.match(/<style>\s*([\s\S]*?)\s*<\/style>/);
     if (styleMatch) {
         fs.appendFileSync('src/app/globals.css', `\n${styleMatch[1]}\n`);
     }
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) continue;
  
  let jsx = bodyMatch[1];
  
  jsx = jsx.replace(/class=/g, 'className=')
           .replace(/for=/g, 'htmlFor=')
           .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
           .replace(/style="([^"]*)"/g, (match, p1) => {
             const styleObj = {};
             p1.split(';').forEach(rule => {
                let [key, val] = rule.split(':');
                if(key && val) {
                    key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    styleObj[key] = val.trim();
                }
             });
             return `style={${JSON.stringify(styleObj)}}`;
           })
           .replace(/<img(.*?[^\/])>/gi, '<img$1 />')
           .replace(/<input(.*?[^\/])>/gi, '<input$1 />')
           .replace(/<br>/gi, '<br />')
           .replace(/<hr(.*?[^\/])>/gi, '<hr$1 />');

  // Fix SVG inline issues
  jsx = jsx.replace(/stroke-width=/gi, 'strokeWidth=')
           .replace(/stroke-linecap=/gi, 'strokeLinecap=')
           .replace(/stroke-linejoin=/gi, 'strokeLinejoin=')
           .replace(/fill-rule=/gi, 'fillRule=')
           .replace(/clip-rule=/gi, 'clipRule=');

  // Some inputs might have multiple closes now if they already had />
  jsx = jsx.replace(/\/>>/g, '/>');

  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  const component = `
export default function ${componentName}Page() {
  return (
    <>
      ${jsx}
    </>
  );
}
`;
  
  fs.writeFileSync(`src/app/${name}/page.tsx`, component);
  console.log(`Migrated ${name}.html to src/app/${name}/page.tsx`);
}

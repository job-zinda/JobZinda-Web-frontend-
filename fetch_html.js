const https = require('https');
const fs = require('fs');

const screens = [
  { name: 'freelancers', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzcwNzhkMDNiM2E3YTRiOThhYWI2YWQ4OTljMWQ3MmQyEgsSBxCgnoGB7AYYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjY4NjkzODI1MDA1MjQ2NTI0&filename=&opi=89354086' },
  { name: 'login', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzMzYjRjYmRiNTcwZjRjNzhiZmY0ZjBlZDllOTJjZjY3EgsSBxCgnoGB7AYYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjY4NjkzODI1MDA1MjQ2NTI0&filename=&opi=89354086' },
  { name: 'profile', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZjMzAyNjRkNDhiMTQxY2U5MTMzNWI4ZGEwMmQwMTk4EgsSBxCgnoGB7AYYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjY4NjkzODI1MDA1MjQ2NTI0&filename=&opi=89354086' },
  { name: 'feed', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E5MzY5NGVlNTVjNjQ1YTFiNGI4YWI0NjZlOTllYzI1EgsSBxCgnoGB7AYYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjY4NjkzODI1MDA1MjQ2NTI0&filename=&opi=89354086' },
  { name: 'dashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc4NDgzNmM1M2UxNDQxZDdiNmUxNDY1M2M5ODEyMWRhEgsSBxCgnoGB7AYYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjY4NjkzODI1MDA1MjQ2NTI0&filename=&opi=89354086' },
  { name: 'subscription', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdiOGI0Yzk0ZTQxYzQ0ZGE5MTIyN2RmZDE5NWVmNWM3EgsSBxCgnoGB7AYYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjY4NjkzODI1MDA1MjQ2NTI0&filename=&opi=89354086' }
];

async function download(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(filename, data);
        resolve();
      });
    }).on('error', reject);
  });
}

(async () => {
    if (!fs.existsSync('stitching')) fs.mkdirSync('stitching');
    for (const screen of screens) {
        await download(screen.url, `stitching/${screen.name}.html`);
        console.log(`Downloaded ${screen.name}`);
    }
})();

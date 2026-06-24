import fs from 'fs';

const files = [
  { path: '/Users/zys93/Documents/做题/quiz-system/单选题题目_已格式化.docx', tags: '近代史, 毛概, 思政, 单选' },
  { path: '/Users/zys93/Documents/做题/quiz-system/多选题题目_已格式化.docx', tags: '近代史, 毛概, 思政, 多选' },
];

for (const f of files) {
  const buf = fs.readFileSync(f.path);
  const form = new FormData();
  form.set('file', new Blob([buf]), f.path.split('/').pop());
  form.set('tags', f.tags);
  const res = await fetch('http://localhost:3001/api/questions/upload', { method: 'POST', body: form });
  const data = await res.json();
  console.log(`${f.tags}: ${data.message}`);
}

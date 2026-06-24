import mammoth from 'mammoth';
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

const INPUT = '/Users/zys93/Desktop/单选题题目.docx';
const OUTPUT = '/Users/zys93/Documents/做题/quiz-system/单选题题目_已格式化.docx';

const { value: text } = await mammoth.extractRawText({ buffer: fs.readFileSync(INPUT) });
const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

const questions = [];

for (const line of lines) {
  const m = line.match(/^(\d+)\.\s*\(单选题\)(.+?)（([A-Z])）\s*([\s\S]*)$/);
  if (m) {
    questions.push({ num: m[1], question: m[2].trim(), answer: m[3], optionsPart: m[4].trim() });
    continue;
  }
  const alt = line.match(/^(\d+)\.\s*\(单选题\)(.+?)\(\)\s*（([A-Z])）\s*([\s\S]*)$/);
  if (alt) {
    questions.push({ num: alt[1], question: alt[2].trim(), answer: alt[3], optionsPart: alt[4].trim() });
  }
}

function parseOptions(text) {
  const opts = [];
  const parts = text.split(/(?=[A-D]\.)/);
  for (const p of parts) {
    const optMatch = p.match(/^([A-D])\.\s*(.+)/);
    if (optMatch) opts.push({ label: optMatch[1], text: optMatch[2].trim() });
  }
  return opts;
}

console.log(`解析到 ${questions.length} 道题目`);

const docChildren = [];
docChildren.push(new Paragraph({
  children: [new TextRun({ text: '单选题题库', bold: true, size: 32 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
}));

questions.forEach((q, i) => {
  const opts = parseOptions(q.optionsPart);
  docChildren.push(new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text: `${i + 1}. ${q.question}`, size: 24 })],
  }));
  for (const opt of opts) {
    docChildren.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: `${opt.label}. ${opt.text}`, size: 24 })],
    }));
  }
  docChildren.push(new Paragraph({
    spacing: { before: 60, after: 200 },
    children: [new TextRun({ text: `答案：${q.answer}`, size: 24, bold: true })],
  }));
  docChildren.push(new Paragraph({
    children: [new TextRun({ text: '---', size: 20, color: '999999' })],
  }));
});

const doc = new Document({ sections: [{ children: docChildren }] });
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUTPUT, buffer);
console.log(`✅ 已生成: ${OUTPUT}`);
console.log(`共 ${questions.length} 道题`);

import mammoth from 'mammoth';
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

const INPUT = '/Users/zys93/Desktop/多选题题库.docx';
const OUTPUT = '/Users/zys93/Documents/做题/quiz-system/多选题题目_已格式化.docx';

const { value: text } = await mammoth.extractRawText({ buffer: fs.readFileSync(INPUT) });
const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

const questions = [];
const re = /^(\d+)\.\s*\(多选题\)(.+?)（([A-D]+)）\s*([\s\S]*)$/;

for (const line of lines) {
  const m = line.match(re);
  if (m) {
    let qText = m[2].trim();
    // Clean trailing garbage like "× 0 分   × 0 分"
    qText = qText.replace(/×\s*\d+\s*分\s*$/, '').trim();
    questions.push({ num: m[1], question: qText, answer: m[3], optionsPart: m[4].trim() });
  }
}

function parseOptions(text) {
  // Remove trailing "× 0 分" patterns
  text = text.replace(/\s*×\s*[\d\s]*分\s*/g, '').trim();
  const opts = [];
  const parts = text.split(/(?=[A-D]\.)/);
  for (const p of parts) {
    const m = p.match(/^([A-D])\.\s*(.+)/);
    if (m) opts.push({ label: m[1], text: m[2].trim() });
  }
  return opts;
}

console.log(`解析到 ${questions.length} 道多选题`);

const docChildren = [];
docChildren.push(new Paragraph({
  children: [new TextRun({ text: '多选题题库', bold: true, size: 32 })],
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

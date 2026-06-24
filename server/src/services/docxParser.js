import mammoth from 'mammoth';

function normalizeText(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function parseAnswer(raw) {
  return raw.replace(/^答案[：:]\s*/, '').trim();
}

function classifyType(parsedAnswer, optionCount) {
  const a = parsedAnswer.replace(/\s/g, '');
  if (/^[对错√×]$/.test(a) || /^(正确|错误)$/.test(a)) return 'judge';
  if (/^[A-Z]{2,}$/.test(a)) return 'multiple';
  if (/^[A-Z]$/.test(a)) return 'single';
  if (optionCount > 0) return 'single';
  return 'short';
}

export async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const text = normalizeText(result.value);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const questions = [];
  let current = null;
  const optionPattern = /^([A-Z])[.、．)]\s*(.+)/;
  const answerPattern = /^答案[：:]/;
  const questionNumPattern = /^\d+[.、．)]\s*(.+)/;
  const separatorPattern = /^---+$/;

  for (const line of lines) {
    if (separatorPattern.test(line)) continue;

    const qMatch = line.match(questionNumPattern);
    if (qMatch) {
      if (current) questions.push(finalizeQuestion(current));
      current = { question: qMatch[1], options: [], answerRaw: '' };
      continue;
    }

    if (!current) {
      current = { question: line, options: [], answerRaw: '' };
      continue;
    }

    if (answerPattern.test(line)) {
      current.answerRaw = line;
      continue;
    }

    const optMatch = line.match(optionPattern);
    if (optMatch) {
      current.options.push(optMatch[2]);
      continue;
    }

    current.question += ' ' + line;
  }

  if (current) questions.push(finalizeQuestion(current));
  return questions.filter(q => q.answer);
}

function finalizeQuestion(raw) {
  const answer = parseAnswer(raw.answerRaw);
  const type = classifyType(answer, raw.options.length);

  const result = { type, question: raw.question.trim(), answer };
  if (type === 'judge') {
    result.options = ['对', '错'];
  } else if (type === 'short') {
    result.options = [];
  } else {
    result.options = raw.options;
  }
  return result;
}

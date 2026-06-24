import fs from 'fs';

const content = `1. 2 + 2 = ?
A. 1
B. 2
C. 3
D. 4
答案：D

2. 以下哪些是编程语言？
A. Python
B. HTML
C. Java
D. Markdown
答案：AC

3. JavaScript 是静态类型语言。
答案：错

4. 请简述 RESTful API 的设计原则。
答案：使用HTTP协议，资源通过URL定位，使用GET/POST/PUT/DELETE方法操作资源，无状态通信。`;

console.log('=== 示例文档内容 ===\n');
console.log(content);
console.log('\n将上述内容保存为 .docx 或 .txt 文件后上传即可测试。');
console.log('推荐使用 Word 打开后保存为 docx 格式。');

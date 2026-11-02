const net = require('node:net');

// Minimal SMTP receiver for fictitious integration data. Keeps messages in
// process memory and never writes activation tokens to CI logs or disk.
async function startCapture() {
  const messages = [];
  let rejectNext = false;
  const server = net.createServer((socket) => {
    socket.setEncoding('utf8');
    let buffer = '';
    let body = '';
    let inData = false;
    let loginStep = 0;
    const reply = (line) => socket.write(`${line}\r\n`);
    reply('220 local-capture ESMTP');
    socket.on('data', (chunk) => {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (inData) {
          if (line === '.') {
            inData = false;
            if (rejectNext) {
              rejectNext = false;
              reply('451 Temporary local failure');
            } else {
              messages.push(body);
              reply('250 Captured');
            }
            body = '';
          } else body += `${line.startsWith('..') ? line.slice(1) : line}\n`;
          continue;
        }
        if (loginStep) {
          loginStep = loginStep === 1 ? 2 : 0;
          reply(loginStep ? '334 UGFzc3dvcmQ6' : '235 Authenticated');
        } else if (/^EHLO /i.test(line)) {
          reply('250-local-capture'); reply('250 AUTH PLAIN LOGIN');
        } else if (/^HELO /i.test(line)) reply('250 local-capture');
        else if (/^AUTH PLAIN/i.test(line)) reply('235 Authenticated');
        else if (/^AUTH LOGIN/i.test(line)) {
          loginStep = 1; reply('334 VXNlcm5hbWU6');
        } else if (/^(MAIL FROM|RCPT TO|RSET|NOOP)/i.test(line)) reply('250 OK');
        else if (/^DATA$/i.test(line)) { inData = true; reply('354 End data with <CRLF>.<CRLF>'); }
        else if (/^QUIT$/i.test(line)) { reply('221 Bye'); socket.end(); }
        else reply('500 Unsupported command');
      }
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { port: server.address().port, messages,
    rejectOnce() { rejectNext = true; },
    close() { return new Promise((resolve) => server.close(resolve)); } };
}

module.exports = { startCapture };

import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import nodemailer from 'nodemailer';
import { deliverEmail } from '../app/lib/server/emailDelivery.ts';

async function smtpFixture(outcomes) {
  const sockets = new Set(); let transactions = 0;
  const server = net.createServer(socket => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket)); socket.on('error', () => {});
    socket.write('220 local.fixture ESMTP\r\n');
    let buffer = ''; let data = false;
    socket.on('data', chunk => {
      buffer += chunk.toString();
      let delimiter;
      while ((delimiter = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, delimiter); buffer = buffer.slice(delimiter + 2);
        if (data) {
          if (line === '.') {
            data = false;
            const outcome = outcomes[transactions++];
            if (outcome === 'accepted') socket.write('250 message accepted\r\n');
            // A missing DATA acknowledgement models acceptance ambiguity, not a confirmed failure.
          }
        } else if (/^EHLO|^HELO/.test(line)) socket.write('250 local.fixture\r\n');
        else if (/^MAIL FROM/.test(line)) socket.write('250 sender ok\r\n');
        else if (/^RCPT TO/.test(line)) {
          if (outcomes[transactions] === 'rejected') { transactions++; socket.write('550 recipient rejected\r\n'); }
          else socket.write('250 recipient ok\r\n');
        } else if (line === 'DATA') { data = true; socket.write('354 end with dot\r\n'); }
        else if (line === 'QUIT') { socket.end('221 goodbye\r\n'); }
        else if (/^RSET|^NOOP/.test(line)) socket.write('250 ok\r\n');
      }
    });
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const transport = nodemailer.createTransport({ host: '127.0.0.1', port: server.address().port, secure: false,
    ignoreTLS: true, connectionTimeout: 500, greetingTimeout: 500, socketTimeout: 100 });
  return {
    send: () => transport.sendMail({ from: 'sender@example.test', to: 'firm@example.test', subject: 'Synthetic fixture', text: 'Synthetic test only' }),
    count: () => transactions,
    close: async () => { transport.close(); for (const socket of sockets) socket.destroy(); await new Promise(resolve => server.close(resolve)); },
  };
}
for (const terminal of ['accepted', 'rejected']) {
  test(`real local SMTP ${terminal} is classified without extra transport`, async () => {
    const fixture = await smtpFixture([terminal]);
    try {
      const records = [];
      const result = await deliverEmail({ send: fixture.send, recipient: 'firm@example.test', formId: 'contact', consentStatus: 'denied', sink: record => records.push(record) });
      assert.equal(result.outcome, terminal === 'rejected' ? 'recipient_rejected' : terminal); assert.equal(fixture.count(), 1);
      assert.deepEqual(records.filter(record => record.event_name === 'email_result').map(record => record.outcome), [terminal === 'rejected' ? 'recipient_rejected' : terminal]);
    } finally { await fixture.close(); }
  });
}
for (const second of ['accepted', 'unknown', 'rejected']) {
  test(`real SMTP DATA timeout then ${second}: exactly one retry, retained ambiguity`, async () => {
    const fixture = await smtpFixture(['unknown', second]);
    try {
      const records = [];
      const result = await deliverEmail({ send: fixture.send, recipient: 'firm@example.test', formId: 'trademark_evaluation', consentStatus: 'unknown', sink: record => records.push(record) });
      assert.equal(fixture.count(), 2); assert.equal(result.attempts, 2);
      assert.equal(result.outcome, second === 'accepted' ? 'accepted' : 'unknown');
      assert.deepEqual(records.filter(record => record.event_name === 'email_result').map(record => record.outcome), ['unknown', second === 'rejected' ? 'recipient_rejected' : second]);
      assert.equal(new Set(records.map(record => record.submission_id)).size, 1);
      assert.equal(new Set(records.map(record => record.attempt_id)).size, 2);
      assert.equal(Boolean(result.outcomeEventId), second === 'accepted');
    } finally { await fixture.close(); }
  });
}

const WebSocket = require('ws');
const http = require('http');

// 强制绑定到 Railway 内部监听地址，避免端口冲突
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

// 直接使用 Railway 分配的端口，绝不 fallback
const PORT = process.env.PORT;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});
// 在现有代码基础上，加上这一条路由处理
const server = http.createServer((req, res) => {
  if (req.url === '/ok') {
    res.writeHead(200);
    res.end('ok');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  }
});

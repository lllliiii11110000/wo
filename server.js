const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  res.end('OK');
});

const wss = new WebSocket.Server({ server });

// 必须只使用 Railway 分配的端口，不能写死 8080
const PORT = process.env.PORT;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
});

wss.on('connection', (ws) => {
  console.log('✅ 新客户端已连接');
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
  ws.on('close', () => console.log('❌ 客户端断开连接'));
});

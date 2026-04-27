const WebSocket = require('ws');
const http = require('http');

// 创建 HTTP 服务器，必须这样才能被 Railway 正确映射
const server = http.createServer((req, res) => {
  // 允许来自 github.io 的跨域请求
  res.setHeader('Access-Control-Allow-Origin', 'https://wq70.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  res.end();
});

// 挂载 WebSocket 服务
const wss = new WebSocket.Server({ server });

// 必须监听 0.0.0.0，Railway 才能把外部流量转发进来
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// 消息广播逻辑，和你原来的功能完全一致
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    // 把消息转发给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

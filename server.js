const WebSocket = require('ws');
const http = require('http');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 关键：允许来自 github.io 的跨域请求
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

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// 消息广播逻辑
wss.on('connection', (ws) => {
  console.log('新客户端已连接');
  
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('客户端已断开连接');
  });
});

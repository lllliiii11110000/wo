const WebSocket = require('ws');
const http = require('http');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 健康检查路径（Railway 需要）
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 读取端口
const PORT = process.env.PORT || 8080;

// 启动服务器（监听所有地址）
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket 服务
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // 广播给所有连接的客户端
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

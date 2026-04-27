const WebSocket = require('ws');
const http = require('http');

// 创建 HTTP 服务器（Railway 必须这样才能正确映射端口）
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 你要的那段，Railway 会自动注入 PORT 环境变量
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// 消息广播逻辑
wss.on('connection', (ws) => {
  console.log('新客户端已连接');
  
  ws.on('message', (message) => {
    // 把消息转发给所有客户端，实现群聊效果
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

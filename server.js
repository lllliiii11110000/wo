// ==================== EPhone 联机聊天服务器 ====================

const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const MAX_USERS = 200;

// 在线用户 Map: userId -> { ws, nickname, avatar }
const onlineUsers = new Map();

// ==================== HTTP 服务器 ====================

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("EPhone 联机服务器运行中");
});

// ==================== WebSocket 服务器 ====================

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  let currentUserId = null;

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);

      switch (data.type) {
        case "register": {
          const { userId, nickname, avatar } = data;
          if (!userId || !nickname) {
            sendToClient(ws, { type: "register_error", error: "缺少必要参数" });
            return;
          }
          if (onlineUsers.size >= MAX_USERS && !onlineUsers.has(userId)) {
            sendToClient(ws, { type: "register_error", error: "服务器已满" });
            return;
          }
          currentUserId = userId;
          onlineUsers.set(userId, { ws, nickname, avatar });
          sendToClient(ws, { type: "register_success" });
          console.log(
            `[注册] ${nickname} (${userId}) 已上线，当前在线: ${onlineUsers.size}`
          );
          break;
        }

        case "heartbeat": {
          sendToClient(ws, { type: "heartbeat_ack" });
          break;
        }

        case "search_user": {
          const target = onlineUsers.get(data.searchId);
          if (target) {
            sendToClient(ws, {
              type: "search_result",
              found: true,
              user: {
                userId: data.searchId,
                nickname: target.nickname,
                avatar: target.avatar,
              },
            });
          } else {
            sendToClient(ws, { type: "search_result", found: false });
          }
          break;
        }

        case "friend_request": {
          const targetUser = onlineUsers.get(data.toUserId);
          if (targetUser) {
            sendToClient(targetUser.ws, {
              type: "friend_request",
              fromUserId: data.fromUserId,
              fromNickname: data.fromNickname,
              fromAvatar: data.fromAvatar,
            });
          }
          break;
        }

        case "accept_friend_request": {
          const requester = onlineUsers.get(data.fromUserId);
          if (requester) {
            sendToClient(requester.ws, {
              type: "friend_request_accepted",
              fromUserId: data.toUserId,
              fromNickname: data.toNickname,
              fromAvatar: data.toAvatar,
            });
          }
          break;
        }

        case "reject_friend_request": {
          const requester = onlineUsers.get(data.fromUserId);
          if (requester) {
            sendToClient(requester.ws, { type: "friend_request_rejected" });
          }
          break;
        }

        case "send_message": {
          const recipient = onlineUsers.get(data.toUserId);
          if (recipient) {
            sendToClient(recipient.ws, {
              type: "receive_message",
              fromUserId: data.fromUserId,
              message: data.message,
              timestamp: data.timestamp,
            });
          }
          break;
        }

        case "create_group": {
          // 通知所有群成员（除了创建者）
          const members = data.members || [];
          console.log(
            `[群聊] 创建群聊请求: ${data.groupName}, 成员:`,
            members.map((m) => m.userId)
          );
          members.forEach((member) => {
            if (member.userId !== data.creatorId) {
              const memberUser = onlineUsers.get(member.userId);
              console.log(
                `[群聊] 通知成员 ${member.userId}: ${ memberUser ? "在线" : "不在线" }`
              );
              if (memberUser) {
                sendToClient(memberUser.ws, {
                  type: "receive_group_created",
                  groupId: data.groupId,
                  groupName: data.groupName,
                  members: data.members,
                  creatorId: data.creatorId,
                  timestamp: Date.now(),
                });
              }
            }
          });
          console.log(
            `[群聊] ${data.creatorId} 创建了群聊 ${data.groupName} (${members.length}人)`
          );
          break;
        }

        case "send_group_message": {
          // 转发群消息给所有群成员（除了发送者）
          const groupMembers = data.members || [];
          groupMembers.forEach((memberId) => {
            if (memberId !== data.fromUserId) {
              const memberUser = onlineUsers.get(memberId);
              if (memberUser) {
                sendToClient(memberUser.ws, {
                  type: "receive_group_message",
                  groupId: data.groupId,
                      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

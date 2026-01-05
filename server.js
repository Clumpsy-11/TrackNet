const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const wss = new WebSocket.Server({ server });

  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let username = 'Anonymous';

    clients.set(clientId, { ws, username });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'join') {
          username = data.username || 'Anonymous';
          clients.set(clientId, { ws, username });

          const joinMessage = {
            type: 'system',
            content: `${username} has joined the chat`,
            timestamp: new Date().toISOString(),
          };

          clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify(joinMessage));
            }
          });
        } else if (data.type === 'chat') {
          const chatMessage = {
            type: 'chat',
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username,
            content: data.content,
            timestamp: new Date().toISOString(),
          };

          clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify(chatMessage));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      const client = clients.get(clientId);
      if (client) {
        const leaveMessage = {
          type: 'system',
          content: `${client.username} has left the chat`,
          timestamp: new Date().toISOString(),
        };

        clients.forEach((c) => {
          if (c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify(leaveMessage));
          }
        });

        clients.delete(clientId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(clientId);
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

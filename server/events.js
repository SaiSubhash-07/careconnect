// Server-Sent Events (SSE) Manager for CareConnect Real-Time Push Stream
const clients = new Set();

export const eventsHandler = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'CareConnect SSE Real-Time Stream Connected', timestamp: new Date().toISOString() })}\n\n`);

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
};

export const broadcastEvent = (eventType, payload) => {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
};

export const getConnectedClientsCount = () => clients.size;

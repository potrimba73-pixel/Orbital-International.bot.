const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Orbital Bot is running!');
});

server.listen(3000, () => {
  console.log('Keep-alive server on port 3000');
});

module.exports = server;
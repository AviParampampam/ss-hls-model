const { join } = require('path')
const net = require('net')
const config = require(join(__dirname, '../../config.json'))

const HOST = process.env.HOST || config.tcp.host || 'localhost'
const PORT = process.env.PORT || config.tcp.port || 9050

const tcpServer = net.createServer()
let sockets = []

// Прослушиваем событие на подключение
tcpServer.on('connection', (sock) => {
  sockets.push(sock)
  const clientAddress = sock.remoteAddress
  const clientPort = sock.remotePort

  // Прослушиваем событие на получение данных от клиента
  sock.on('data', (data) => {})

  // Отправка сообщения
  sock.write()

  // Прослушиваем событие на закрытие соединения
  sock.on('close', (data) => {
    sockets.splice(sockets.indexOf(sock), 1)
  })
})

tcpServer.listen(PORT, HOST, () => {
  console.log('TCP сервер запущен')
})

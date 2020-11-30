const { join } = require('path')

const { msleep } = require(join(__dirname, 'lib/helper'))
// const tcpServer = require(join(__dirname, 'api/tcp-server'))
const Camera = require(join(__dirname, 'lib/cam'))

const myCam1 = new Camera({
    id: 'cam1',
    key: 'utKKwPVjgwMsKW6F4HdP2W',
    title: 'Тестовая камера',
    rtsp: 'rtsp://admin:123456@192.168.1.15:554/ch01.264?dev=1'
})

const myCam2 = new Camera({
    id: 'cam2',
    key: 'nU7jYhy6T0nV1J5HXxIza',
    title: 'Еще одна тестовая камера',
    rtsp: 'rtsp://admin:12345678@192.168.1.33:554/ch01.264?dev=1'
})

const myCam3 = new Camera({
    id: 'cam3',
    key: 'bzaZjuFa8JEvv6nKQQ2',
    title: 'Очередная тестовая камера',
    rtsp: 'rtsp://admin:12345678@192.168.1.101:554/ch01/0'
})

const myCam4 = new Camera({
    id: 'cam4',
    key: 'u8rdXWfJ2vGwTqxxgnZ3',
    title: 'И это тоже тестовая камера',
    rtsp: 'rtsp://admin:12345678@192.168.1.221:554//h264Preview_01_main'
})

const myCam5 = new Camera({
    id: 'cam5',
    key: 'iau&nIO23jgAgagagw2',
    title: 'Ре0лИнkkk',
    rtsp: 'rtsp://admin:12345678@192.168.1.220:554/0'
})


myCam1.hls.run()
myCam2.hls.run()
myCam3.hls.run()
myCam4.hls.run()
myCam5.hls.run()

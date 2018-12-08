import mc from 'minecraft-protocol'
import World from './world'
import Client from './client'

const palier1 = new World('./palier1/level.dat', './palier1/region')

void (async function() {
	await palier1.load()
})()

let server = mc.createServer({
	'online-mode': false,
	motd: 'Aresrpg Vanilla',
	encryption: true,
	host: '0.0.0.0',
	port: 25565,
	version: '1.12.1',
	maxPlayers: 1,
})

server.on('login', function(socketClient) {
	const addr = socketClient.socket.remoteAddress
	console.log('Incoming connection', '(' + addr + ')')
	const client = new Client(socketClient, palier1)
	client.login()
	client.sendMsg('§2test', chatPosition.CHATBOX)
	// client.teleport(-1576, 101, -1830)
	client.teleport(-1576, 1, -1830)
})

server.on('error', function(error) {
	console.log('Error:', error)
})

server.on('listening', function() {
	console.log('Server listening on port', server.socketServer.address().port)
})

const chatPosition = {
	CHATBOX: 0,
	HOTBAR: 2,
}

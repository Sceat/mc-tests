import mc from 'minecraft-protocol'
import World from '@aresrpg/aresrpg-world'
import Player from '@player/player'
import { VERSION, ChunkReader } from '@/constant'
import VoidLoader from './emptyChunkGen'
import menu from '@player/menu'

// const loader = new ChunkReader('./palier1')
// const palier1 = new World(::loader.load)

// const voidLoader = new VoidLoader((x, z) => !(x | z))
// const voidLoader = new VoidLoader((x, z) => x === 1 && z === 0)
const voidLoader = new VoidLoader(() => true)
const voidWorld = new World(::voidLoader.load)

const server = mc.createServer({
	'online-mode': false,
	motd: 'Aresrpg Vanilla',
	encryption: true,
	host: '0.0.0.0',
	port: 25565,
	version: VERSION,
	maxPlayers: 1,
})

void (async function() {
	// await palier1.preload(38, 38, 10)
	await voidWorld.preload(0, 0, 5)
	server.on('login', async function(client) {
		console.log('Incoming connection', '(' + client.socket.remoteAddress + ')')
		const player = new Player(client)
		player.login(0)
		player.abilities(true, true, true, true)
		// player.world = palier1
		player.world = voidWorld
		// player.teleport(469, 170, 646)
		player.teleport(14, 70.3, 2.5, -90)
		// player.setItem()
		setTimeout(() => {
			player.blockChange(16, 70, 0, 10)
			// menu(player)
		}, 1000)
	})

	server.on('error', function(error) {
		console.log('Error:', error)
	})

	server.on('listening', function() {
		console.log('Server listening on port', server.socketServer.address().port)
	})
})()

const chatPosition = {
	CHATBOX: 0,
	HOTBAR: 2,
}

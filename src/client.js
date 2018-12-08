export default class Client {
	x
	y
	z
	yaw
	pitch
	onGround
	lastChunkPos

	constructor(socketClient, world) {
		this.world = world
		this.socketClient = socketClient
		this.ipAdress = socketClient.socket.remoteAdress
		socketClient.on('end', ::this.onEnd)
		socketClient.on('error', ::this.onError)
		socketClient.on('packet', ::this.onPacket)
		socketClient.on('chat', ::this.onChat)
		socketClient.on('position', ::this.onMove) // throtle diz mothafucker ? we'll see
	}

	login() {
		this.socketClient.write('login', {
			entityId: this.socketClient.id,
			levelType: 'default',
			gameMode: 1,
			dimension: 0,
			difficulty: 2,
			maxPlayers: 1,
			reducedDebugInfo: false,
		})
	}

	async teleport(x, y, z, yaw = 137, pitch = 0, flags = 0x00) {
		this.socketClient.write('position', {
			x,
			y,
			z,
			yaw,
			pitch,
			flags,
		})
		Object.assign(this, { x, y, z, yaw, pitch })
		await this.world.sendChunks(this)
	}

	sendChunk(x, z, chunkData, groundUp = true, bitMap = 0xffff, blockEntities = []) {
		console.log(`sending chunk [${x},${z}] `)
		this.socketClient.write('map_chunk', {
			x,
			z,
			groundUp,
			bitMap,
			chunkData,
			blockEntities,
		})
	}

	sendMsg(msg, position) {
		this.socketClient.write('chat', {
			message: JSON.stringify(msg),
			position: position,
		})
	}

	get chunkPos() {
		const x = Math.floor(this.x / 16)
		const z = Math.floor(this.z / 16)
		return { x, z }
	}

	async onMove(pkt) {
		Object.assign(this, pkt)
		const { x, z } = this.chunkPos
		const lastX = this.lastChunkPos?.x
		const lastZ = this.lastChunkPos?.z
		if (x !== lastX || z !== lastZ) {
			await this.world.sendChunks(this)
			this.lastChunkPos = this.chunkPos
		}
	}

	onEnd() {
		console.log(`Connection closed [${this.ipAdress}]`)
	}

	onError(err) {
		console.error(`Client error [${err}]`)
	}

	onChat(pkt) {
		const { message } = pkt
		const msg = {
			translate: 'chat.type.text',
			with: ['Server', `§2 ${message} [${this.x},${this.z}]`],
		}
		this.socketClient.write('chat', { message: JSON.stringify(msg), position: 0 })
	}

	onPacket(data, meta) {
		let drop = ['position', 'look', 'keep_alive', 'position_look', 'entity_action']
		if (drop.includes(meta.name)) return
		console.log('=================')
		console.log(`Packet: ${meta.name}`)
		console.log(data)
		console.log(meta)
	}
}

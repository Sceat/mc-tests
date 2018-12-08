export default class Client {
	loadedChunks = new Map()
	viewDistance = 5

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
		this.godMod()
	}

	godMod() {
		this.socketClient.write('abilities', { flags: 15, flyingSpeed: 0.1, walkingSpeed: 0.1 })
	}

	async teleport(x, y, z, yaw = 137, pitch = 0, flags = 0x00) {
		const payload = { x, y, z, yaw, pitch, flags }
		this.socketClient.write('position', payload)
		Object.assign(this, payload)
		await this.loadChunks()
	}

	loadChunk(x, z, chunk, groundUp = true, bitMap = 0xffff, blockEntities = []) {
		this.socketClient.write('map_chunk', { x, z, groundUp, bitMap, chunkData: chunk.dump(), blockEntities })
		this.loadedChunks.set(`${x}%${z}`, { x, z })
	}

	unloadChunk(x, z) {
		this.socketClient.write('unload_chunk', { x, z })
		this.loadedChunks.delete(`${x}%${z}`)
	}

	async loadChunks() {
		this.unloadChunks()
		const chunks = await Promise.all(this.world.nearbyChunks(this))
		console.log(`+ ${chunks.filter(({ x, z }) => !this.loadedChunks.has(`${x}%${z}`)).length} chunks`)
		for (let { x, z, chunk } of chunks) {
			if (!this.loadedChunks.has(`${x}%${z}`)) this.loadChunk(x, z, chunk)
		}
	}

	unloadChunks() {
		const { x: cX, z: cZ } = this.chunkPos
		const chunks = []
		for (let { x, z } of this.loadedChunks.values()) {
			if (Math.abs(x - cX) > this.viewDistance || Math.abs(z - cZ) > this.viewDistance) chunks.push({ x, z })
		}
		console.log(`- ${chunks.length} chunks`)
		chunks.forEach(({ x, z }) => this.unloadChunk(x, z))
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
			this.lastChunkPos = this.chunkPos
			await this.loadChunks()
		}
	}

	async onEnd() {
		console.log(`Connection closed [${this.ipAdress}]`)
	}

	async onError(err) {
		console.error(`Client error [${err}]`)
	}

	async onChat(pkt) {
		const { message } = pkt
		const msg = {
			translate: 'chat.type.text',
			with: ['Server', `§2 ${message} [${this.x},${this.z}]`],
		}
		this.socketClient.write('chat', { message: JSON.stringify(msg), position: 0 })
	}

	async onPacket(data, meta) {
		let drop = ['position', 'look', 'keep_alive', 'position_look', 'entity_action', 'arm_animation']
		if (drop.includes(meta.name)) return
		console.log('=================')
		console.log(`Packet: ${meta.name}`)
		console.log(data)
		console.log(meta)
	}
}

import Utils from '@aresrpg/aresrpg-world'
import throttle from '@utils/throttle'

export default class Listener {
	listenPackets() {
		this.client.on('end', ::this.onEnd)
		this.client.on('error', ::this.onError)
		this.client.on('packet', ::this.onPacket)
		this.client.on('chat', ::this.onChat)
		this.client.on('position', ::this.onMove)
		this.client.on('look', ::this.onLook)
	}

	@throttle(100)
	onMove(pkt) {
		Object.assign(this, pkt)
		const { x, z } = Utils.chunkFromBlock(this.x, this.z)
		const lastX = this.lastChunkPos?.x
		const lastZ = this.lastChunkPos?.z
		if (x !== lastX || z !== lastZ) {
			this.lastChunkPos = Utils.chunkFromBlock(this.x, this.z)
			this.loadChunks()
		}
	}

	@throttle(100)
	onLook(pkt) {
		Object.assign(this, pkt)
	}

	onEnd() {
		console.log(`Connection closed [${this.client.socket.remoteAddress}]`)
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
		this.client.write('chat', { message: JSON.stringify(msg), position: 0 })
	}

	onPacket(data, meta) {
		let drop = [] //['position', 'look', 'keep_alive', 'position_look', 'entity_action', 'arm_animation']
		if (!this.logPkt || drop.includes(meta.name)) return
		console.log('=================')
		console.log(`Packet: ${meta.name}`)
		console.log(data)
		console.log(meta)
	}
}

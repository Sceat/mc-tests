import mapLoader from './nativeMapLoader'

export default class World {
	chunks = []
	constructor(levelPath, regionsPath) {
		this.loader = new mapLoader(levelPath, regionsPath)
	}

	async load() {
		await this.loader.load()
		this.level = this.loader.lvl
	}

	async cachedChunk(x, z) {
		let chunk = this.chunks[x] && this.chunks[x][z]
		if (!chunk) {
			chunk = await this.loader.readChunk(x, z)
			if (!this.chunks[x]) this.chunks[x] = []
			this.chunks[x][z] = chunk
		}
		return chunk
	}

	async sendChunks(client) {
		const { x, z } = client
		const chunkX = Math.floor(x / 16)
		const chunkZ = Math.floor(z / 16)
		const chunkk = await this.cachedChunk(chunkX, chunkZ)
		client.sendChunk(chunkX, chunkZ, chunkk.dump())
		// for (let posX = chunkX - 2; posX < chunkX + 2; posX++) {
		// 	for (let posZ = chunkZ - 2; posZ < chunkZ + 2; posZ++) {
		// 		const chunk = await this.cachedChunk(posX, posZ)
		// 		client.sendChunk(posX, posZ, chunk.dump())
		// 	}
		// }
	}
}

import mapLoader from './nativeMapLoader'
import spiral from 'spiralloop'

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
		await Promise.resolve() // wtf ? that kind of code u don't know why it's there but it doesn't work without it ¯\_(ツ)_/¯
		let chunk = this.chunks[x] && this.chunks[x][z]
		if (!chunk) {
			chunk = await this.loader.readChunk(x, z)
			if (!this.chunks[x]) this.chunks[x] = []
			this.chunks[x][z] = chunk
		}
		return { x, z, chunk }
	}

	nearbyChunks(client) {
		const { x: cX, z: cZ } = client.chunkPos
		const chunks = []
		const view = client.viewDistance
		const range = view * 2
		const posX = cX - view
		const posZ = cZ - view
		spiral([range, range], (x, z) => {
			chunks.push(this.cachedChunk(x + posX, z + posZ))
		})
		return chunks
	}
}

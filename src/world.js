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
		await Promise.resolve() // ¯\_(ツ)_/¯
		let chunk = this.chunks[x] && this.chunks[x][z]
		if (!chunk) {
			chunk = await this.loader.readChunk(x, z)
			if (!this.chunks[x]) this.chunks[x] = []
			this.chunks[x][z] = chunk
		}
		return { x, z, chunk }
	}

	/**
	 *
	 * @param {Number} chunkX
	 * @param {Number} chunkZ
	 * @param {Number} distance view distance
	 * @returns {Promise[]} An array of promises which resolve as a chunk
	 */
	nearbyChunks(chunkX, chunkZ, distance) {
		const chunks = []
		const range = distance * 2
		const posX = chunkX - distance
		const posZ = chunkZ - distance
		spiral([range, range], (x, z) => {
			chunks.push(this.cachedChunk(x + posX, z + posZ))
		})
		return chunks
	}
}
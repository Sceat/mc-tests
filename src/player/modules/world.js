import Utils from '@aresrpg/aresrpg-world'
import Vec3 from 'vec3'

export default class World {
	loadChunk(x, z, chunk, groundUp = true, bitMap = 0xffff, blockEntities = []) {
		if (chunk) {
			this.client.write('map_chunk', { x, z, groundUp, bitMap, chunkData: chunk.dump(), blockEntities })
			this.loadedChunks.set(`${x}%${z}`, { x, z })
		}
	}

	unloadChunk(chunkX, chunkZ) {
		this.client.write('unload_chunk', { chunkX, chunkZ })
		this.loadedChunks.delete(`${chunkX}%${chunkZ}`)
	}

	async loadChunks() {
		this.unloadChunks()
		const { x: cX, z: cZ } = Utils.chunkFromBlock(this.x, this.z)
		const chunks = await Promise.all(this.world.nearbyChunks(cX, cZ, this.viewDistance))
		for (let { x, z, chunk } of chunks) {
			if (!this.loadedChunks.has(`${x}%${z}`)) this.loadChunk(x, z, chunk)
		}
	}

	unloadChunks() {
		const { x: cX, z: cZ } = Utils.chunkFromBlock(this.x, this.z)
		for (let { x, z } of this.loadedChunks.values()) {
			if (Math.abs(x - cX) > this.viewDistance || Math.abs(z - cZ) > this.viewDistance) this.unloadChunk(x, z)
		}
	}

	compressBlock(id, data) {
		return (id << 4) | data
	}

	multiBlockChange(blocks) {
		const records = new Map()
		for (let { x, y, z, id, data } of blocks) {
			const { x: chunkX, z: chunkZ } = Utils.chunkFromBlock(x, z)
			const key = `${chunkX},${chunkZ}`
			const buff = records.get(key) || []
			const relative = Utils.relativeBlockPosition(chunkX, chunkZ, x, z)
			const horizontalPos = Utils.encodeRelativeBlockPosition(relative)
			buff.push({ horizontalPos, y, blockId: this.compressBlock(id, data) })
			records.set(key, buff)
		}
		for (let [key, value] of records.entries()) {
			const [chunkX, chunkZ] = key.split(',')
			this.client.write('multi_block_change', {
				chunkX,
				chunkZ,
				records: value,
			})
		}
	}

	blockChange(x, y, z, id, data) {
		this.client.write('block_change', {
			location: new Vec3(x, y, z),
			type: this.compressBlock(id, data),
		})
	}
}

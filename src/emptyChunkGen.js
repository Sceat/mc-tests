import { Chunk, Block } from '@/constant'
import Vec3 from 'vec3'

export default class {
	constructor(chunkPredicate) {
		this.chunkPredicate = chunkPredicate
	}

	load(x, z) {
		if (!this.chunkPredicate(x, z)) return
		const chunk = new Chunk()
		chunk.initialize((x, y, z) => {
			chunk.setSkyLight(new Vec3(x, y, z), 15)
			return new Block(0)
		})
		return chunk
	}
}

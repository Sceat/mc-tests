import { level, Anvil } from 'prismarine-provider-anvil'

const anvil = Anvil('1.12.1')
const err = new Error("Map loader haven't been loaded")

export default class {
	loaded = false
	constructor(levelPath, regionsPath) {
		Object.assign(this, { levelPath, regionsPath })
		this.lvl = undefined
	}

	async load() {
		this.anvil = new anvil(this.regionsPath)
		this.lvl = await level.readLevel(this.levelPath)
		this.loaded = true
	}

	get level() {
		if (!this.loaded) throw err
		return this.lvl
	}

	async readChunk(x, z) {
		if (!this.loaded) throw err
		return await this.anvil.load(x, z)
	}
}

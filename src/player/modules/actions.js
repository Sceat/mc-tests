import { Item } from '@/constant'
import MapColor from '@aresrpg/aresrpg-map-colors'

const testItem = new Item(358, 1, 0)

export default class Actions {
	abilities(invulnerable = false, flying = false, allowFlying = false, creative = false) {
		let flags = 0
		if (invulnerable) flags |= 1
		if (flying) flags |= 2
		if (allowFlying) flags |= 4
		if (creative) flags |= 8
		this.client.write('abilities', { flags, flyingSpeed: 0.1, walkingSpeed: 0.1 })
	}

	teleport(x, y, z, yaw = 137, pitch = 0, flags = 0x00) {
		const payload = { x, y, z, yaw, pitch, flags }
		this.client.write('position', payload)
		Object.assign(this, payload)
		this.loadChunks()
	}

	showFrame() {
		const buffer = []
		const size = 128
		const { id } = MapColor.nearestMatch(49, 27, 146)
		for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) buffer.push(id)

		this.client.write('map', {
			itemDamage: 0,
			scale: 4,
			trackingPosition: false,
			icons: [],
			columns: size - 1,
			rows: size - 1,
			x: 0,
			y: 0,
			data: Buffer.from(buffer),
		})
	}

	setItem() {
		this.client.write('set_slot', {
			windowId: 0,
			slot: 36,
			item: Item.toNotch(testItem),
		})
		this.showFrame()
		// this.client.write('window_items', {
		// 	windowId: 0,
		// 	items: [0, 0, 0, Item.toNotch(testItem), Item.toNotch(testItem), 0, Item.toNotch(testItem)],
		// })
	}
}

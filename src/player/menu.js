export default function showBlocks(player) {
	const blocks = []
	for (let z = 0; z < 5; z++) {
		for (let y = 0; y < 4; y++) {
			blocks.push({ x: 16, y: y + 70, z, id: 1, data: 0 })
		}
	}
	player.multiBlockChange(blocks)
}

import injectModules from './moduleInjector'

@injectModules
export default class Player {
	loadedChunks = new Map()
	world = undefined
	viewDistance = 5

	logPkt = false

	x
	y
	z
	yaw
	pitch
	onGround

	constructor(client) {
		this.client = client
		this.listenPackets()
	}

	login(dimension = 0) {
		this.client.write('login', {
			entityId: this.client.id,
			levelType: 'default',
			gameMode: 2,
			dimension,
			difficulty: 2,
			maxPlayers: 1,
			reducedDebugInfo: false,
		})
	}
}

export default class Chat {
	sendMsg(msg, position) {
		this.client.write('chat', {
			message: JSON.stringify(msg),
			position: position,
		})
	}
}

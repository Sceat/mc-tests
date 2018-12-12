export default function(ms) {
	let called = 0
	return (...a) => {
		const { value: fnc } = a[2]
		return {
			...a[2],
			value(...a) {
				const now = Date.now()
				if (now - called < ms) return
				this::fnc(...a)
				called = now
			},
		}
	}
}

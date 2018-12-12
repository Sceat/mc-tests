import mixin from '../utils/mixins'
import fs from 'fs'

const modules = {}

fs.readdirSync(`${__dirname}/modules`).forEach(file => {
	const mod = require(`./modules/${file}`).default
	const props = Object.getOwnPropertyDescriptors(mod.prototype)
	for (let p in props) modules[p] = mod.prototype[p]
})
export default mixin({ ...modules })

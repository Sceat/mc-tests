import { Anvil } from 'prismarine-provider-anvil'
import prismarineItem from 'prismarine-item'
import prismarineChunk from 'prismarine-chunk'
import prismarineBlock from 'prismarine-block'

export const VERSION = '1.13.2'

export const ChunkReader = Anvil(VERSION)
export const Item = prismarineItem(VERSION)
export const Chunk = prismarineChunk(VERSION)
export const Block = prismarineBlock(VERSION)

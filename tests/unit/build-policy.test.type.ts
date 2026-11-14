

export type Chunk = { initial: boolean; files: string[]; modules: Array<{ name: string; modules?: Array<{ name: string }> }> };

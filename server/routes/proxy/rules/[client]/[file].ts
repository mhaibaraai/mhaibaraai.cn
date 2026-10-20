const CLIENTS = ['surge', 'quantumult-x'] as const
type Client = typeof CLIENTS[number]

/** 以 Surge 规则为单一来源，按客户端输出对应语法 */
export default defineEventHandler(async (event) => {
  const client = getRouterParam(event, 'client') as Client
  const name = getRouterParam(event, 'file')?.replace(/\.list$/, '') ?? ''

  if (!CLIENTS.includes(client) || !RULE_SET_NAME.test(name)) {
    throw createError({ status: 404, statusText: 'Rule set not found' })
  }

  const source = await useStorage('assets:server').getItem<string>(`rules:${name}.list`)
  if (typeof source !== 'string') {
    throw createError({ status: 404, statusText: 'Rule set not found' })
  }

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return client === 'surge' ? toSurge(source) : toQuantumultX(source, 'proxy')
})

import Fastify from 'fastify'
import { registrarRotasPortaria } from './dominios/portaria'
import { registrarRotasAreas } from './dominios/areas'

// Cria a aplicação (logger: true = mostra no terminal cada pedido que chega)
const app = Fastify({ logger: true })

// Rota inicial: serve para conferir se a API está no ar
app.get('/', async () => {
  return {
    message: 'API do Sistema de Gestão de Condomínios',
    recursos: ['/visitantes', '/areas-comuns']
  }
})

// Registra as rotas de cada domínio
registrarRotasPortaria(app)
registrarRotasAreas(app)

// Liga o servidor
const start = async () => {
  try {
    await app.listen({ port: 3000, host: 'localhost' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

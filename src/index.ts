import Fastify from 'fastify'
import { registrarRotasVisitantes } from './routes/visitantes'
import { registrarRotasAreasComuns } from './routes/areasComuns'

// Cria a aplicação (logger: true = mostra no terminal cada pedido que chega)
const app = Fastify({ logger: true })

// Rota inicial: serve para conferir se a API está no ar
app.get('/', async () => {
  return {
    message: 'API do Sistema de Gestão de Condomínios',
    recursos: ['/visitantes', '/areas-comuns']
  }
})

// Cria as rotas de cada recurso
registrarRotasVisitantes(app)
registrarRotasAreasComuns(app)

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

# API do Condomínio (Fastify + TypeScript + Drizzle + MySQL)

Dois recursos com CRUDL completo: **Visitantes** e **Áreas Comuns**.

## Como rodar

1. Tenha o Node.js e um MySQL ligado. Crie o banco:  `CREATE DATABASE condominio;`
2. Abra o arquivo `.env` e ajuste usuário e senha do seu MySQL:
   `DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/condominio"`
3. No terminal, dentro desta pasta:
   ```
   npm install
   npx drizzle-kit generate
   npx drizzle-kit migrate
   npm run dev
   ```
4. Abra http://localhost:3000 — deve aparecer a mensagem de boas-vindas.
5. No Postman: **Import** → `condominio.postman_collection.json`.

## Rotas

| Ação | Visitantes | Áreas comuns |
|---|---|---|
| Listar | GET /visitantes | GET /areas-comuns |
| Ler um | GET /visitantes/:id | GET /areas-comuns/:id |
| Criar | POST /visitantes | POST /areas-comuns |
| Atualizar tudo | PUT /visitantes/:id | PUT /areas-comuns/:id |
| Atualizar parte | PATCH /visitantes/:id | PATCH /areas-comuns/:id |
| Deletar | DELETE /visitantes/:id | DELETE /areas-comuns/:id |

## Estrutura

```
src/
  index.ts              liga o servidor
  validacoes.ts         confere os dados enviados (400)
  db/schema.ts          desenho das tabelas
  db/index.ts           conexão com o MySQL
  routes/visitantes.ts  as 6 rotas de visitantes
  routes/areasComuns.ts as 6 rotas de áreas comuns
drizzle.config.ts       instruções para o drizzle-kit (migrations)
```

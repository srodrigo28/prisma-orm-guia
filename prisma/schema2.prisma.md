### model Categoria {
  id           Int       @id @default(autoincrement())
  nome         String    @unique
  descricao    String
  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt

  // 1. A Mágica aqui: Avisamos que essa Categoria tem uma lista (Array) de Produtos
  produtos     Produto[] 
}

### model Produto {
  id           Int       @id @default(autoincrement())
  nome         String    @unique
  quantidade   Int
  preco        Float
  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt

  // 2. Criamos a coluna física que vai guardar o número do ID da Categoria
  categoriaId  Int

  // 3. Criamos o link virtual que o Prisma usa para conectar as duas tabelas
  categoria    Categoria @relation(fields: [categoriaId], references: [id])
}
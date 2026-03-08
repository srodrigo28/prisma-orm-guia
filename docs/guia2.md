Fase 1: A Fundação e a Escolha do Banco
1. npm install prisma --save-dev

O que faz: Baixa o motor do Prisma (CLI) apenas para o seu ambiente de desenvolvimento.

2. npm install @prisma/client

O que faz: Instala a biblioteca real que o Next.js vai importar (import { prisma } from...) para conversar com o banco em produção.

3. npx prisma init (O momento da escolha)

O que faz: Cria a pasta prisma/, o arquivo prisma.config.ts (na v7) e o .env. O comando muda dependendo do banco que você quer usar:

Opção A (SQLite): npx prisma init --datasource-provider sqlite
(O .env ficará assim: DATABASE_URL="file:./dev.db")

Opção B (MySQL): npx prisma init --datasource-provider mysql
(O .env ficará assim: DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/nome_do_banco")

Opção C (PostgreSQL): npx prisma init --datasource-provider postgresql
(O .env ficará assim: DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/nome_do_banco?schema=public")

Fase 2: O Desenho das Tabelas
(Aqui você abre o arquivo schema.prisma e escreve seu model Produto com as colunas necessárias).

4. npx prisma format

O que faz: Alinha o código do seu schema.prisma. Se você bagunçou os espaços, ele deixa tudo perfeitamente identado e fácil de ler.

5. npx prisma validate

O que faz: Lê o seu schema.prisma antes de você tentar criar o banco e avisa se tem algum erro de digitação, tipo errado ou relacionamento quebrado.

Fase 3: Sincronização (A Criação Física)
6. npx prisma db push

O que faz: Força o envio do seu desenho direto para o banco de dados (seja SQLite, MySQL ou Postgres) sem criar histórico. Excelente para o começo do projeto quando você está mudando colunas toda hora.

7. npx prisma migrate dev --name init

O que faz: O comando oficial de desenvolvimento. Ele cria um arquivo físico (ex: 20260307_init.sql) com as instruções exatas do que mudou no banco. Isso garante que sua equipe (ou você no futuro) saiba como o banco evoluiu.

8. npx prisma generate

O que faz: O motor lê o seu banco e cria os tipos de TypeScript dentro da pasta node_modules. É isso que faz o seu Next.js ter autocomplete quando você digita prisma.produto.. (O comando 7 já roda este comando por baixo dos panos automaticamente).

Fase 4: Gerenciamento e Testes Iniciais
9. npx prisma studio

O que faz: Abre uma interface administrativa no navegador (localhost:5555) para você ver, cadastrar ou deletar registros manualmente em qualquer um dos três bancos.

10. npx prisma db seed

O que faz: Executa um arquivo script (geralmente seed.ts) que você cria para encher o banco com dados falsos automaticamente. Perfeito para não ter que cadastrar 50 produtos na mão toda vez que o banco for apagado.

Fase 5: Manutenção e Troubleshooting (Quando as coisas dão errado)
11. npx prisma migrate reset

O que faz: Apaga todo o banco de dados, recria a estrutura lendo todas as suas migrações e roda o script de seed (se existir). É o botão de reiniciar para limpar a bagunça local.

12. npx prisma db pull

O que faz: A engenharia reversa. Se você conectou o Prisma num banco MySQL ou Postgres que já existia na sua empresa cheio de tabelas, você roda isso e o Prisma "escreve" o schema.prisma sozinho lendo as tabelas lá do servidor.

13. npx prisma migrate resolve

O que faz: Se o seu banco travou no meio de uma migração (por exemplo, a energia caiu ou o MySQL desligou no meio do comando), você usa isso para avisar o Prisma se ele deve ignorar aquela migração quebrada ou tentar de novo.

Fase 6: O Deploy (Indo para a Nuvem)
14. npx prisma migrate deploy

O que faz: O único comando de migração que você tem permissão para rodar em produção. Ele olha para o banco de dados real dos seus clientes, vê quais arquivos .sql faltam aplicar e aplica. Ele nunca apaga tabelas por acidente ou reseta dados.
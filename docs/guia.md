# 📦 Gerenciador de Estoque - Guia Completo de Instalação
Este guia detalha a criação do projeto do zero, configuração do banco de dados e implementação do CRUD

### Passo 1: Crie o Projeto Next.js
Inicie um novo projeto utilizando a estrutura padrão do Next.js 15.

```bash
npx create-next-app@latest crud-prisma --ts --tailwind --eslint --src-dir --app --use-npm
cd crud-prisma
```

> Marque "YES" para "Would you like to use React Compiler?" e "NO" para "Would you like to customize the import alias (`@/*` by default)?"

### Passo 2: Instale Dependências de Banco e UI
Instale o Prisma, o driver para SQLite e a biblioteca de ícones.

```bash
npm install @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3 lucide-react
npm install -D prisma
```

### Passo 3: Inicializar o Prisma
Crie a estrutura inicial do Prisma no seu projeto.

```bash
npx prisma init
```

### Passo 4: Configure o .env

````
DATABASE_URL="file:./dev.db"
````

### Passo 5: Configure o prisma.config.ts
Para versões recentes do Prisma, as URLs de conexão devem ser gerenciadas via arquivo de configuração. Crie o arquivo prisma.config.ts na raiz:

````
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
````

### Passo 6: Configure o Schema do Prisma
Abra o arquivo prisma/schema.prisma e defina o modelo de dados para os produtos.

````
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model Produto {
  id           Int      @id @default(autoincrement())
  nome         String
  quantidade   Int
  preco        Float
  criadoEm     DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}
````

### Passo 7: Crie e Aplicar Migrations

```bash
npx prisma migrate dev --name init_db
```

### Passo: 8: Gere o Prisma Client

```bash
npx prisma generate
```

### Passo 9: Configure a Conexão (src/app/lib/prisma.ts)
Crie o arquivo de conexão Singleton para evitar o esgotamento de conexões no SQLite durante o desenvolvimento.

````
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL nao definida no ambiente.");

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter, log: ["query", "error", "warn"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
````

> OBS: O arquivo citado deve ser criado de forma manual



### Passo 10: Crie Rota Geral da API (src/app/api/produtos/route.ts)
Implemente os métodos para listar (GET) e cadastrar (POST) produtos

````
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET: Listar todos os produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    });
    return NextResponse.json(produtos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

// POST: Criar um novo produto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, quantidade, preco } = body;

    // Validação de entrada
    if (!nome || quantidade === undefined || preco === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, quantidade e preco." },
        { status: 400 }
      );
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        quantidade: Number(quantidade),
        preco: Number(preco),
      },
    });

    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar produto" }, { status: 400 });
  }
}
````

> OBS: O arquivo citado deve ser criado de forma manual

### Passo 11: Crie Rota Dinâmica (src/app/api/produtos/[id]/route.ts)
Implemente a lógica de item único. No Next.js 15, o params deve ser tratado como Promise.

````
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

interface Context {
  params: Promise<{ id: string }>;
}

// 1. GET: Buscar produto por ID
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: idParam } = await params; // Unwrapping aqui
    const id = parseInt(idParam);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(produto);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// 2. PUT: Atualizar produto por ID
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id: idParam } = await params; // Unwrapping aqui
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome: body.nome,
        quantidade: Number(body.quantidade),
        preco: Number(body.preco),
      },
    });

    return NextResponse.json(produtoAtualizado);
  } catch (error: any) {
    console.error("Erro no PUT:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 400 });
  }
}

// 3. DELETE: Excluir produto por ID
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id: idParam } = await params; // Unwrapping aqui
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.produto.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Erro no DELETE:", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 400 });
  }
}
````

> OBS: O arquivo citado deve ser criado de forma manual

### Passo 12: Implemente o Frontend (src/app/page.tsx)
Crie a interface para interagir com a API, tratando estados de carregamento e o erro de NaN em campos numéricos.

````
"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, X } from "lucide-react";

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  criadoEm: string;
}

export default function ProdutosPage() {
  // Estados de Dados
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Estado do Formulário
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: "", quantidade: 0, preco: 0 });

  // 1. Carregar Produtos
  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/produtos");
      if (!res.ok) throw new Error("Falha ao carregar produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      setErro("Não foi possível carregar a lista de produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarProdutos(); }, []);

  // 2. Salvar (Create/Update)
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    const metodo = idEditando ? "PUT" : "POST";
    const url = idEditando ? `/api/produtos/${idEditando}` : "/api/produtos";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao salvar produto");

      await carregarProdutos();
      fecharModal();
    } catch (err) {
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  // 3. Excluir
  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) carregarProdutos();
    } catch (err) {
      alert("Erro ao excluir produto.");
    }
  };

  // Filtro de Busca (Memoizado para performance)
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, produtos]);

  // Helpers de Modal
  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setIdEditando(produto.id);
      setFormData({ nome: produto.nome, quantidade: produto.quantidade, preco: produto.preco });
    } else {
      setIdEditando(null);
      setFormData({ nome: "", quantidade: 0, preco: 0 });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setIdEditando(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Estoque de Produtos</h1>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produto..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </div>

        {/* Estados de Carregamento/Erro */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        )}

        {erro && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{erro}</div>}

        {!loading && produtosFiltrados.length === 0 && (
          <div className="text-center py-20 text-gray-500 italic">Nenhum produto encontrado.</div>
        )}

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{produto.nome}</h3>
                <div className="flex gap-2">
                  <button onClick={() => abrirModal(produto)} className="text-gray-400 hover:text-blue-600">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleExcluir(produto.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">Qtd: <span className="font-medium text-gray-900">{produto.quantidade}</span></p>
                <p className="text-2xl font-bold text-blue-600">R$ {produto.preco.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Formulário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{idEditando ? "Editar Produto" : "Novo Produto"}</h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  required
                  type="text"
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded-lg"
                    // Se for NaN, exibe string vazia para o input não quebrar
                    value={isNaN(formData.quantidade) ? "" : formData.quantidade}
                    onChange={(e) => setFormData({
                      ...formData,
                      quantidade: parseInt(e.target.value) // O parseInt de campo vazio gera NaN
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border p-2 rounded-lg"
                    // Mesma lógica: evita passar NaN para o atributo value
                    value={isNaN(formData.preco) ? "" : formData.preco}
                    onChange={(e) => setFormData({
                      ...formData,
                      preco: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>
              <button
                disabled={salvando}
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex justify-center"
              >
                {salvando ? <Loader2 className="animate-spin" /> : "Confirmar e Salvar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
````

### Passo 13: Teste
Rode o projeto com o comando

```bash
npm run dev
```

E dps faça os testes do CRUD
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Listar todos os produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true,
      },
      orderBy: { criadoEm: "desc" },
    });
    return NextResponse.json(produtos);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

// POST: Criar um novo produto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, quantidade, preco, categoriaId } = body;

    // Validação de entrada
    if (!nome || quantidade === undefined || preco === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, quantidade e preco." },
        { status: 400 }
      );
    }

    // Verifica se existe com mesmo nome antes de cadastrar
    const produtoExistente = await prisma.produto.findFirst({
      where: {
        nome: nome.trim(),
      },
    });

    if (produtoExistente) {
      return NextResponse.json(
        { error: "Já existe um produto cadastrado com esse nome." },
        { status: 409 }
      );
    }

    // Chegou aqui cadastra
    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        quantidade: Number(quantidade),
        preco: Number(preco),
        categoriaId: categoriaId ? Number(categoriaId) : null,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(novoProduto, { status: 201 });

    
  } catch { // Chegou aqui dar um erro
    return NextResponse.json({ error: "Erro ao cadastrar produto" }, { status: 400 });
  }
}

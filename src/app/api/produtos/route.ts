import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
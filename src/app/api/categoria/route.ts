import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Listar todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { criadoEm: "desc" },
    });
    return NextResponse.json(categorias);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

// POST: Criar uma nova categoria
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao } = body;

    // Validação de entrada
    if (!nome || !descricao) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome e descricao." },
        { status: 400 }
      );
    }

    // Verifica se existe com mesmo nome antes de cadastrar
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome: nome.trim(),
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: "Já existe uma categoria cadastrada com esse nome." },
        { status: 409 }
      );
    }

    // Chegou aqui cadastra
    const novaCategoria = await prisma.categoria.create({
      data: {
        nome,
        descricao,
      },
    });

    return NextResponse.json(novaCategoria, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao cadastrar categoria" }, { status: 400 });
  }
}

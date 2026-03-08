import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Context {
  params: Promise<{ id: string }>;
}

// 1. GET: Buscar categoria por ID
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    return NextResponse.json(categoria);
  } catch {
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// 2. PUT: Atualizar categoria por ID
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { nome, descricao } = body;

    if (!nome || !descricao) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome e descricao." },
        { status: 400 }
      );
    }

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id },
      data: {
        nome,
        descricao,
      },
    });

    return NextResponse.json(categoriaAtualizada);
  } catch (error: unknown) {
    console.error("Erro no PUT categoria:", error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 400 });
  }
}

// 3. DELETE: Excluir categoria por ID
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Erro no DELETE categoria:", error);
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 400 });
  }
}

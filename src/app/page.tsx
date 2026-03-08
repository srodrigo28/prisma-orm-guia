"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit2, Loader2, Plus, Search, Trash2, X } from "lucide-react";

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  criadoEm: string;
  categoriaId: number | null;
  categoria?: {
    id: number;
    nome: string;
  } | null;
}

interface ProdutoForm {
  nome: string;
  quantidade: number;
  preco: number;
  categoriaId: string;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busca, setBusca] = useState("");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCategoria, setErroCategoria] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProdutoForm>({
    nome: "",
    quantidade: 0,
    preco: 0,
    categoriaId: "",
  });

  const [novaCategoria, setNovaCategoria] = useState({
    nome: "",
    descricao: "",
  });

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/produtos");
      if (!res.ok) throw new Error("Falha ao carregar produtos");
      const data = await res.json();
      setProdutos(data);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar a lista de produtos.");
    } finally {
      setLoading(false);
    }
  };

  const carregarCategorias = async () => {
    try {
      const res = await fetch("/api/categoria");
      if (!res.ok) throw new Error("Falha ao carregar categorias");
      const data = await res.json();
      setCategorias(data);
    } catch {
      setCategorias([]);
    }
  };

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
  }, []);

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    const metodo = idEditando ? "PUT" : "POST";
    const url = idEditando ? `/api/produtos/${idEditando}` : "/api/produtos";

    try {
      const payload = {
        ...formData,
        categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null,
      };

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar produto");
      await carregarProdutos();
      fecharModalProduto();
    } catch {
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  const handleCriarCategoriaRapida = async () => {
    setErroCategoria(null);

    if (!novaCategoria.nome.trim() || !novaCategoria.descricao.trim()) {
      setErroCategoria("Informe nome e descrição da nova categoria.");
      return;
    }

    setSalvandoCategoria(true);
    try {
      const res = await fetch("/api/categoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novaCategoria.nome.trim(),
          descricao: novaCategoria.descricao.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao criar categoria");
      }

      const criada: Categoria = await res.json();
      setCategorias((prev) => [criada, ...prev]);
      setFormData((prev) => ({ ...prev, categoriaId: String(criada.id) }));
      setNovaCategoria({ nome: "", descricao: "" });
      setMostrarFormCategoria(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar categoria";
      setErroCategoria(message);
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) await carregarProdutos();
    } catch {
      alert("Erro ao excluir produto.");
    }
  };

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, produtos]);

  const abrirModalProduto = (produto?: Produto) => {
    setErroCategoria(null);
    setMostrarFormCategoria(false);

    if (produto) {
      setIdEditando(produto.id);
      setFormData({
        nome: produto.nome,
        quantidade: produto.quantidade,
        preco: produto.preco,
        categoriaId: produto.categoriaId ? String(produto.categoriaId) : "",
      });
    } else {
      setIdEditando(null);
      setFormData({ nome: "", quantidade: 0, preco: 0, categoriaId: "" });
    }

    setNovaCategoria({ nome: "", descricao: "" });
    setModalAberto(true);
  };

  const fecharModalProduto = () => {
    setModalAberto(false);
    setIdEditando(null);
    setMostrarFormCategoria(false);
    setErroCategoria(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex h-40 flex-col items-center gap-5 rounded-xl bg-violet-500 p-5">
          <h1 className="text-3xl font-bold text-white">Estoque de Produtos</h1>

          <div className="flex w-full gap-2 pb-5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                className="w-full rounded-lg border-2 border-blue-400 py-3 pl-5 pr-4 text-xl tracking-wider text-slate-950 outline-blue-400"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button
              onClick={() => abrirModalProduto()}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden pr-3 tracking-wide sm:inline">Adicionar</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        )}

        {erro && <div className="rounded-lg bg-red-100 p-4 text-red-700">{erro}</div>}

        {!loading && produtosFiltrados.length === 0 && (
          <div className="py-20 text-center italic text-gray-500">
            Nenhum produto encontrado.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{produto.nome}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalProduto(produto)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleExcluir(produto.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">
                  Qtd:{" "}
                  <span className="font-medium text-gray-900">
                    {produto.quantidade}
                  </span>
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {produto.preco.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Categoria:{" "}
                  <span className="font-semibold text-gray-900">
                    {produto.categoria?.nome ?? "Sem categoria"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-600">
                {idEditando ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={fecharModalProduto}
                className="text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label className="mb-1 block text-xl font-medium text-gray-700">
                  Nome
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-lg font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-blue-300 p-2 text-xl text-slate-900 outline-blue-400 focus:ring-2 focus:ring-blue-500"
                    value={Number.isNaN(formData.quantidade) ? "" : formData.quantidade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-lg font-medium text-gray-700">
                    Preço (R$)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-blue-300 p-2 text-xl text-slate-900 outline-blue-400 focus:ring-2 focus:ring-blue-500"
                    value={Number.isNaN(formData.preco) ? "" : formData.preco}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preco: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-lg font-medium text-gray-700">
                  Categoria
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-full rounded-lg border border-blue-300 p-2 text-base text-slate-900 outline-blue-400 focus:ring-2 focus:ring-blue-500"
                    value={formData.categoriaId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoriaId: e.target.value })
                    }
                  >
                    <option value="">Sem categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={String(categoria.id)}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setMostrarFormCategoria((prev) => !prev)}
                    className="rounded-lg border border-blue-500 px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Nova
                  </button>
                </div>
              </div>

              {mostrarFormCategoria && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                  <p className="mb-2 text-sm font-semibold text-blue-700">
                    Criar nova categoria sem sair do cadastro
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nome da categoria"
                      className="w-full rounded-lg border border-blue-300 p-2 text-sm text-slate-900 outline-blue-400"
                      value={novaCategoria.nome}
                      onChange={(e) =>
                        setNovaCategoria({ ...novaCategoria, nome: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Descrição"
                      className="w-full rounded-lg border border-blue-300 p-2 text-sm text-slate-900 outline-blue-400"
                      value={novaCategoria.descricao}
                      onChange={(e) =>
                        setNovaCategoria({
                          ...novaCategoria,
                          descricao: e.target.value,
                        })
                      }
                    />
                    {erroCategoria && (
                      <p className="text-sm text-red-600">{erroCategoria}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCriarCategoriaRapida}
                      disabled={salvandoCategoria}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {salvandoCategoria ? "Salvando..." : "Salvar categoria"}
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={salvando}
                type="submit"
                className="flex w-full justify-center rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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

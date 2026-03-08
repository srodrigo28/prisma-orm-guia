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
        <div className="flex flex-col items-center bg-violet-400 h-40 rounded-xl p-5 gap-5 mb-8">
          
          <h1 className="text-3xl font-bold text-white">Estoque de Produtos</h1>
          
          <div className="flex gap-2 w-full pb-5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produto..."
                className="pl-5 w-full text-xl text-slate-950 tracking-wider pr-4 py-3 rounded-lg border-2 border-blue-400 outline-blue-400"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center 
              gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-10 h-5" /> 
              <span className="hidden sm:inline tracking-wide pr-3">Adicionar</span>
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
              <h2 className="text-2xl font-bold text-blue-600">{idEditando ? "Editar Produto" : "Novo Produto"}</h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-xl font-medium text-gray-700 mb-1">Nome</label>
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
                  <label className="block text-xl font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    required
                    type="text"
                    className="w-full border-blue-300 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-blue-400 text-slate-900 text-xl"
                    // Se for NaN, exibe string vazia para o input não quebrar
                    value={isNaN(formData.quantidade) ? "" : formData.quantidade}
                    onChange={(e) => setFormData({
                      ...formData,
                      quantidade: parseInt(e.target.value) // O parseInt de campo vazio gera NaN
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    required
                    type="text"
                    className="w-full border-blue-300 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-blue-400 text-slate-900 text-xl"
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
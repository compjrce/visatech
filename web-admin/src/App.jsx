import React, { useState, useEffect } from 'react';
import { LogOut, Building2, FileText, ClipboardList, Plus, Eye, X, Edit2, Trash2, Check, AlertTriangle, ChevronUp, ChevronDown, Info } from 'lucide-react';

const API_URL = 'https://visatech-backend.onrender.com/api';

// ==================== HELPERS ====================

function formatCNPJ(v) {
  v = v.replace(/\D/g, '').slice(0, 14);
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatTelefone(v) {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

// ==================== MODAL ESTABELECIMENTO ====================

function ModalEstabelecimento({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    razao_social: item?.razao_social || '',
    nome_fantasia: item?.nome_fantasia || '',
    cnpj: item?.cnpj || '',
    endereco: item?.endereco || '',
    telefone: item?.telefone || '',
    email: item?.email || '',
    ativo: item?.ativo ?? true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.razao_social.trim()) e.razao_social = 'Obrigatório';
    if (!form.cnpj.trim()) e.cnpj = 'Obrigatório';
    else if (form.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'CNPJ inválido';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {item ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {item ? 'Atualize os dados abaixo' : 'Preencha os dados do estabelecimento'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Razão Social */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social <span className="text-red-500">*</span>
            </label>
            <input
              value={form.razao_social}
              onChange={e => set('razao_social', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.razao_social ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="Ex: Farmácia São João Ltda"
            />
            {errors.razao_social && <p className="text-red-500 text-xs mt-1">{errors.razao_social}</p>}
          </div>

          {/* Nome Fantasia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
            <input
              value={form.nome_fantasia}
              onChange={e => set('nome_fantasia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Farmácia São João"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ <span className="text-red-500">*</span>
            </label>
            <input
              value={form.cnpj}
              onChange={e => set('cnpj', formatCNPJ(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.cnpj ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="00.000.000/0000-00"
            />
            {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              value={form.endereco}
              onChange={e => set('endereco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Rua das Flores, 123 - Centro"
            />
          </div>

          {/* Telefone + Email lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                value={form.telefone}
                onChange={e => set('telefone', formatTelefone(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                placeholder="contato@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Status ativo */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Status do estabelecimento</p>
              <p className="text-xs text-gray-500">Estabelecimentos inativos não aparecem no app</p>
            </div>
            <button
              onClick={() => set('ativo', !form.ativo)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.ativo ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ativo ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className={`text-xs font-medium ${form.ativo ? 'text-green-600' : 'text-gray-400'}`}>
            {form.ativo ? '✓ Ativo' : '○ Inativo'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
            ) : (
              <><Check size={16} /> {item ? 'Salvar Alterações' : 'Cadastrar'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL CONFIRMAR EXCLUSÃO ====================

function ModalConfirmar({ nome, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmar exclusão</h3>
        <p className="text-gray-600 text-sm mb-6">
          Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}


// ==================== MODAL ROTEIRO ====================

function ModalRoteiro({ item, estabelecimentos, onSave, onClose }) {
  const [form, setForm] = useState({
    titulo: item?.titulo || '',
    descricao: item?.descricao || '',
    versao: item?.versao || '05',
    tipo: item?.tipo || 'INSPECAO_FARMACIA',
    estabelecimento_id: item?.estabelecimento_id || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Obrigatório';
    if (!form.estabelecimento_id) e.estabelecimento_id = 'Selecione um estabelecimento';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave({ ...form, estabelecimento_id: parseInt(form.estabelecimento_id) });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{item ? 'Editar Roteiro' : 'Novo Roteiro'}</h3>
            <p className="text-sm text-gray-500 mt-1">Preencha os dados do roteiro de inspeção</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Estabelecimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estabelecimento <span className="text-red-500">*</span>
            </label>
            <select
              value={form.estabelecimento_id}
              onChange={e => set('estabelecimento_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${errors.estabelecimento_id ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="">Selecione um estabelecimento...</option>
              {estabelecimentos.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nome_fantasia || e.razao_social} — {e.cnpj}
                </option>
              ))}
            </select>
            {errors.estabelecimento_id && <p className="text-red-500 text-xs mt-1">{errors.estabelecimento_id}</p>}
            {form.estabelecimento_id && (() => {
              const est = estabelecimentos.find(e => e.id === parseInt(form.estabelecimento_id));
              return est ? (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                  <span className="font-semibold">{est.razao_social}</span>
                  {est.cnpj && <span className="ml-2 text-blue-500">CNPJ: {est.cnpj}</span>}
                </div>
              ) : null;
            })()}
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Roteiro <span className="text-red-500">*</span>
            </label>
            <input
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.titulo ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="Ex: Roteiro de Inspeção - Drogaria"
            />
            {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Descrição opcional do roteiro..."
            />
          </div>

          {/* Versão + Tipo lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versão</label>
              <input
                value={form.versao}
                onChange={e => set('versao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: 05"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="INSPECAO_FARMACIA">Inspeção Farmácia</option>
                <option value="INSPECAO_DROGARIA">Inspeção Drogaria</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
            ) : (
              <><Check size={16} /> {item ? 'Salvar' : 'Criar Roteiro'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



// ==================== SEÇÃO C VIEWER (abas I–V) ====================

const ABAS_C = [
  { id: 'I',   label: 'I – Informações Gerais',         prefixo: 'I – Informações Gerais' },
  { id: 'II',  label: 'II – Documentos',                prefixo: 'II – Documentos Apresentados' },
  { id: 'III', label: 'III – MBP',                      prefixo: 'III – MBP' },
  { id: 'IV',  label: 'IV – POPs',                      prefixo: 'IV – POPs' },
  { id: 'V',   label: 'V – Registros',                  prefixo: 'V – Verificação dos Registros' },
];

function SecaoCViewer({ secao, onEditPergunta, onDeletePergunta, onNovaPergunta }) {
  const [abaAtiva, setAbaAtiva] = useState('I');

  const perguntasDaAba = (abaId) => {
    const aba = ABAS_C.find(a => a.id === abaId);
    if (!aba) return [];
    const perguntas = secao.perguntas || [];

    if (abaId === 'IV') {
      // POPs: referencia_legal começa com 'IV' ou 'Art' (os POPs específicos)
      return perguntas.filter(p =>
        p.referencia_legal?.startsWith('IV') ||
        p.referencia_legal?.startsWith('Art') ||
        p.referencia_legal?.startsWith('Inciso') ||
        p.referencia_legal?.startsWith('§')
      );
    }
    return perguntas.filter(p => p.referencia_legal?.startsWith(aba.prefixo));
  };

  const iconeTipo = (tipo) => {
    switch(tipo) {
      case 'SIM_NAO': return '✓/✗';
      case 'SIM_NAO_NA_NO': return 'S/N/NA';
      case 'TEXTO': return 'Aa';
      case 'DATA': return '📅';
      case 'NUMERO': return '#';
      case 'CHECKBOXES': return '☑';
      case 'TABELA_TREINAMENTOS': return '⊞';
      default: return '?';
    }
  };

  const corTipo = (tipo) => {
    switch(tipo) {
      case 'SIM_NAO': return 'bg-green-50 text-green-700';
      case 'TEXTO': return 'bg-blue-50 text-blue-700';
      case 'DATA': return 'bg-yellow-50 text-yellow-700';
      case 'NUMERO': return 'bg-orange-50 text-orange-700';
      case 'CHECKBOXES': return 'bg-indigo-50 text-indigo-700';
      case 'TABELA_TREINAMENTOS': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const perguntas = perguntasDaAba(abaAtiva);

  return (
    <div className="bg-white border-t border-purple-100">
      {/* Abas */}
      <div className="flex overflow-x-auto border-b border-purple-100 bg-purple-50">
        {ABAS_C.map(aba => {
          const count = perguntasDaAba(aba.id).length;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                abaAtiva === aba.id
                  ? 'border-purple-600 text-purple-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-purple-600'
              }`}
            >
              {aba.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${abaAtiva === aba.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da aba */}
      <div className="p-4 space-y-2">
        {perguntas.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">Nenhuma pergunta nesta subseção</p>
          </div>
        ) : (
          perguntas.map((p, idx) => (
            <div key={p.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:border-purple-200 transition-colors">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">{p.texto}</p>
                {p.referencia_legal && !p.referencia_legal.startsWith('I') && !p.referencia_legal.startsWith('V') && (
                  <p className="text-xs text-gray-400 mt-0.5 italic">{p.referencia_legal}</p>
                )}
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${corTipo(p.tipo_resposta)}`}>
                  {iconeTipo(p.tipo_resposta)} {TIPO_RESPOSTA_LABELS[p.tipo_resposta] || p.tipo_resposta}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => onEditPergunta(p)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Editar">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => onDeletePergunta(p.id)} className="p-1 text-red-400 hover:bg-red-50 rounded" title="Excluir">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Nova pergunta */}
        <button
          onClick={onNovaPergunta}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium mt-1">
          <Plus size={15} /> Nova Pergunta nesta Seção
        </button>
      </div>
    </div>
  );
}

// ==================== CONFIGURAÇÃO SEÇÕES A e B ====================

const SECOES_TEMPLATE = {
  A: {
    codigo: 'A',
    titulo: 'IDENTIFICAÇÃO DA EMPRESA / ESTABELECIMENTO',
    tipo_secao: 'IDENTIFICACAO',
    bloqueante: false,
    exige_farmaceutico: false,
    descricao: 'Dados de identificação do estabelecimento inspecionado',
  },
  B: {
    codigo: 'B',
    titulo: 'RESPONSABILIDADE TÉCNICA',
    tipo_secao: 'VALIDACAO',
    bloqueante: true,
    exige_farmaceutico: true,
    descricao: 'Validação da presença do farmacêutico responsável técnico',
  },
  C: {
    codigo: 'C',
    titulo: 'ADMINISTRAÇÃO',
    tipo_secao: 'MISTA',
    bloqueante: false,
    exige_farmaceutico: false,
    descricao: 'Informações gerais, documentos, MBP, POPs e registros',
  },
};

const PERGUNTAS_TEMPLATE = {
  B: [
    { texto: 'Existe responsável técnico no estabelecimento inscrito no CRF?', tipo_resposta: 'SIM_NAO', obrigatoria: true, referencia_legal: 'Art.15 da lei Federal 5991/73 c/c Art.3º da Resolução RDC 44/2009' },
    { texto: 'Farmacêutico presente desde o início da inspeção?', tipo_resposta: 'SIM_NAO', obrigatoria: true, referencia_legal: 'Art.15 § 1º e 2º da Lei Federal 5991/73 c/c Art.3º da Resolução RDC 44/2009' },
    { texto: 'O farmacêutico está identificado de modo distinto dos demais funcionários?', tipo_resposta: 'SIM_NAO', obrigatoria: true, referencia_legal: 'Art.17, parágrafo único da Resolução RDC 44/2009' },
  ],
  C: [
    // I – INFORMAÇÕES GERAIS
    { texto: 'Horário de funcionamento', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'I – Informações Gerais' },
    { texto: 'Número de funcionários', tipo_resposta: 'NUMERO', obrigatoria: false, referencia_legal: 'I – Informações Gerais' },
    { texto: 'Áreas físicas (Vendas / Estoque / Serviços Farmacêuticos / Copa / Gerência / Vestiário / Banheiros / Outros)', tipo_resposta: 'CHECKBOXES', obrigatoria: false, referencia_legal: 'I – Informações Gerais' },
    // II – DOCUMENTOS
    { texto: 'AFE – Número', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'AFE – Atividades (Comércio / Dispensar Medicamento / Publicação / Portaria 344 / Prestação de Serviços)', tipo_resposta: 'CHECKBOXES', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'Certidão de Regularidade do CRF – nº', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'Certidão de Regularidade do CRF – Validade', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'AVCB ou CLCB – nº', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'AVCB ou CLCB – Validade', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'ASO dos funcionários', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'PCMSO e PGR', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'Certificado de controle integrado de pragas – realizado em', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'Certificado de controle integrado de pragas – válido até', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: "Certificado de controle de limpeza de caixa d'água – realizado em", tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: "Certificado de controle de limpeza de caixa d'água – válido até", tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'PGRSS – Atualizado em', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'PGRSS – Tipos de resíduos', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'PGRSS – Comprovantes de recolha RSS', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'PMOC – Elaborado por', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'II – Documentos Apresentados' },
    { texto: 'PMOC – Certificados de manutenção em acordo com o plano', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Lei Federal 13.589/2018 c/c Portaria 3.523/1998 c/c RE 09/2003' },
    // III – MBP
    { texto: 'Manual de Boas Práticas revisado em', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'III – MBP' },
    // IV – POPs
    { texto: 'Procedimento Operacional Padrão atualizado em', tipo_resposta: 'DATA', obrigatoria: false, referencia_legal: 'IV – POPs' },
    { texto: 'Lista mestre de POPs', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'IV – POPs' },
    { texto: 'POPs para todos os serviços farmacêuticos', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'IV – POPs' },
    { texto: "POP – Limpeza da caixa d'água (quando aplicável)", tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 12' },
    { texto: 'POP – Limpeza do espaço para prestação de serviços farmacêuticos', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 16' },
    { texto: 'POP – Aquisição de produtos', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Inciso II do Art. 86' },
    { texto: 'POP – Recebimento de produtos', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 32 e Inciso II do Art. 86' },
    { texto: 'POP – Condições de armazenamento', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: '§4º do Art. 35 e Inciso II do Art. 86' },
    { texto: 'POP – Exposição e organização dos produtos para comercialização', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Inciso III do Art. 86' },
    { texto: 'POP – Produtos com prazo de validade próximo ao vencimento', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 51 e Inciso VI do Art. 86' },
    { texto: 'POP – Destino dos produtos com prazos de validade vencidos', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Inciso V do Art. 86' },
    { texto: 'POP – Comércio por meio remoto', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: '§3º do Art. 56' },
    { texto: 'POP – Atenção farmacêutica', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 65 parágrafo único' },
    { texto: 'POP – Aferição de pressão arterial (se aplicável)', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 72' },
    { texto: 'POP – Aferição de temperatura corporal (se aplicável)', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 72' },
    { texto: 'POP – Perfuração de lóbulo auricular', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 80' },
    { texto: 'POP – Manutenção das condições higiênicas e sanitárias de cada ambiente', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art. 83 e Inciso I do Art. 86' },
    { texto: 'POP – Dispensação de medicamentos', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Inciso IV do Art. 86' },
    // V – REGISTROS
    { texto: 'Temperatura da geladeira', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Temperatura ambiente', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Umidade relativa do ar', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Registros de capacitação periódica dos funcionários', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'Art.24 a 28 da Resolução RDC 44/2009' },
    { texto: 'Capacitação – Cumprimento da legislação sanitária vigente', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Capacitação – Procedimentos Operacionais Padrão (POPs)', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Capacitação – Autocuidado, higiene pessoal e de ambiente, saúde', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Capacitação – Uso e descarte dos EPIs de acordo com PGRSS', tipo_resposta: 'SIM_NAO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Capacitação – Outro', tipo_resposta: 'TEXTO', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
    { texto: 'Tabela de treinamentos (Data / Carga Horária / Ministrante / Assinatura dos capacitados)', tipo_resposta: 'TABELA_TREINAMENTOS', obrigatoria: false, referencia_legal: 'V – Verificação dos Registros' },
  ],
};

const TIPO_RESPOSTA_LABELS = {
  SIM_NAO: 'Sim / Não',
  SIM_NAO_NA_NO: 'S / N / N/A / N/O',
  TEXTO: 'Texto livre',
  DATA: 'Data',
  NUMERO: 'Número',
};

function GerenciarSecoes({ roteiro, token, onClose }) {
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandida, setExpandida] = useState(null);
  const [modalPergunta, setModalPergunta] = useState(null); // { secaoId, item }
  const [salvandoSecao, setSalvandoSecao] = useState(null);
  const [toast, setToast] = useState(null);

  const API_URL = 'https://visatech-backend.onrender.com/api';
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { carregarSecoes(); }, []);

  const carregarSecoes = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/questionarios/${roteiro.id}/secoes`, { headers });
      setSecoes(await r.json());
    } catch { showToast('Erro ao carregar seções', 'error'); }
    setLoading(false);
  };

  const temSecao = (codigo) => secoes.some(s => s.codigo === codigo);

  const adicionarSecao = async (codigo) => {
    setSalvandoSecao(codigo);
    try {
      const template = SECOES_TEMPLATE[codigo];
      const r = await fetch(`${API_URL}/questionarios/${roteiro.id}/secoes`, {
        method: 'POST', headers,
        body: JSON.stringify(template),
      });
      if (!r.ok) { const e = await r.json(); showToast(e.error, 'error'); setSalvandoSecao(null); return; }
      const novaSecao = await r.json();

      // Para seção B, adiciona as perguntas padrão automaticamente
      if (codigo === 'B' && PERGUNTAS_TEMPLATE.B) {
        for (const p of PERGUNTAS_TEMPLATE.B) {
          await fetch(`${API_URL}/secoes/${novaSecao.id}/perguntas`, {
            method: 'POST', headers, body: JSON.stringify(p),
          });
        }
      }

      showToast(`Seção ${codigo} adicionada!`);
      carregarSecoes();
      setExpandida(codigo);
    } catch { showToast('Erro ao adicionar seção', 'error'); }
    setSalvandoSecao(codigo);
    setSalvandoSecao(null);
  };

  const excluirSecao = async (secaoId, codigo) => {
    if (!window.confirm(`Excluir a Seção ${codigo} e todas as suas perguntas?`)) return;
    try {
      await fetch(`${API_URL}/secoes/${secaoId}`, { method: 'DELETE', headers });
      showToast(`Seção ${codigo} removida`);
      carregarSecoes();
      if (expandida === codigo) setExpandida(null);
    } catch { showToast('Erro ao excluir', 'error'); }
  };

  const adicionarPergunta = async (secaoId, form) => {
    try {
      const r = await fetch(`${API_URL}/secoes/${secaoId}/perguntas`, {
        method: 'POST', headers, body: JSON.stringify(form),
      });
      if (!r.ok) { const e = await r.json(); showToast(e.error, 'error'); return false; }
      showToast('Pergunta adicionada!');
      carregarSecoes();
      return true;
    } catch { showToast('Erro ao adicionar pergunta', 'error'); return false; }
  };

  const editarPergunta = async (perguntaId, form) => {
    try {
      const r = await fetch(`${API_URL}/perguntas/${perguntaId}`, {
        method: 'PUT', headers, body: JSON.stringify(form),
      });
      if (!r.ok) { showToast('Erro ao salvar', 'error'); return false; }
      showToast('Pergunta salva!');
      carregarSecoes();
      return true;
    } catch { showToast('Erro ao salvar', 'error'); return false; }
  };

  const excluirPergunta = async (perguntaId) => {
    if (!window.confirm('Excluir esta pergunta?')) return;
    try {
      await fetch(`${API_URL}/perguntas/${perguntaId}`, { method: 'DELETE', headers });
      showToast('Pergunta excluída');
      carregarSecoes();
    } catch { showToast('Erro ao excluir', 'error'); }
  };

  const corSecao = (codigo) => codigo === 'A' ? 'blue' : codigo === 'B' ? 'orange' : 'purple';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Toast */}
        {toast && (
          <div className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium shadow ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Gerenciar Seções</h3>
            <p className="text-sm text-gray-500 mt-0.5">{roteiro.titulo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            ['A', 'B', 'C'].map((codigo) => {
              const secao = secoes.find(s => s.codigo === codigo);
              const cor = corSecao(codigo);
              const corMap = { blue: { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' }, orange: { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' }, purple: { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' } };
              const c = corMap[cor];

              return (
                <div key={codigo} className={`border-2 rounded-xl overflow-hidden ${secao ? c.border : 'border-gray-200 border-dashed'}`}>
                  {/* Header da seção */}
                  <div className={`flex items-center justify-between p-4 ${secao ? c.light : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white ${secao ? c.bg : 'bg-gray-300'}`}>
                        {codigo}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${secao ? 'text-gray-800' : 'text-gray-400'}`}>
                          {SECOES_TEMPLATE[codigo].titulo}
                        </p>
                        <p className="text-xs text-gray-400">{SECOES_TEMPLATE[codigo].descricao}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {secao ? (
                        <>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                            {secao.perguntas?.length || 0} pergunta(s)
                          </span>
                          {codigo !== 'A' && ( // Seção A não tem perguntas manuais
                            <button
                              onClick={() => setExpandida(expandida === codigo ? null : codigo)}
                              className={`p-1.5 rounded-lg hover:bg-white transition-colors ${c.text}`}>
                              {expandida === codigo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          )}
                          <button
                            onClick={() => excluirSecao(secao.id, codigo)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => adicionarSecao(codigo)}
                          disabled={salvandoSecao === codigo}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                          {salvandoSecao === codigo ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : <Plus size={15} />}
                          Adicionar Seção {codigo}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seção A: info de que é preenchida automaticamente */}
                  {secao && codigo === 'A' && (
                    <div className="px-4 py-3 bg-white border-t border-blue-100">
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                          <p className="font-semibold">Campos preenchidos automaticamente no app:</p>
                          <p className="mt-1 text-blue-600">Razão Social, Nome Fantasia e CNPJ vêm do cadastro do estabelecimento. O fiscal preenche: Objetivo da Inspeção, Data e Acompanhante da Vistoria.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seção B: lista de perguntas expansível */}
                  {secao && codigo === 'B' && expandida === 'B' && (
                    <div className="bg-white border-t border-orange-100">
                      <div className="p-4 space-y-2">
                        {(secao.perguntas || []).map((p, idx) => (
                          <div key={p.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                            <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{p.texto}</p>
                              {p.referencia_legal && (
                                <p className="text-xs text-gray-400 mt-0.5 italic">{p.referencia_legal}</p>
                              )}
                              <div className="flex gap-2 mt-1.5">
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  {TIPO_RESPOSTA_LABELS[p.tipo_resposta] || p.tipo_resposta}
                                </span>
                                {p.obrigatoria && (
                                  <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Obrigatória</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setModalPergunta({ secaoId: secao.id, item: p })}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => excluirPergunta(p.id)}
                                className="p-1 text-red-400 hover:bg-red-50 rounded">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Botão nova pergunta */}
                        <button
                          onClick={() => setModalPergunta({ secaoId: secao.id, item: null })}
                          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                          <Plus size={16} /> Nova Pergunta
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                  {/* Seção C: abas I–V */}
                  {secao && codigo === 'C' && expandida === 'C' && (
                    <SecaoCViewer
                      secao={secao}
                      onEditPergunta={(p) => setModalPergunta({ secaoId: secao.id, item: p })}
                      onDeletePergunta={excluirPergunta}
                      onNovaPergunta={() => setModalPergunta({ secaoId: secao.id, item: null })}
                    />
                  )}
              );
            })
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
          <button onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium">
            Fechar
          </button>
        </div>
      </div>

      {/* Modal pergunta */}
      {modalPergunta && (
        <ModalPergunta
          item={modalPergunta.item}
          onSave={async (form) => {
            let ok;
            if (modalPergunta.item) {
              ok = await editarPergunta(modalPergunta.item.id, { ...form, ordem: modalPergunta.item.ordem });
            } else {
              ok = await adicionarPergunta(modalPergunta.secaoId, form);
            }
            if (ok) setModalPergunta(null);
          }}
          onClose={() => setModalPergunta(null)}
        />
      )}
    </div>
  );
}

// ==================== MODAL PERGUNTA ====================

function ModalPergunta({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    texto: item?.texto || '',
    tipo_resposta: item?.tipo_resposta || 'SIM_NAO',
    obrigatoria: item?.obrigatoria ?? true,
    referencia_legal: item?.referencia_legal || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.texto.trim()) return alert('Digite o texto da pergunta');
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-bold">{item ? 'Editar Pergunta' : 'Nova Pergunta'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto da Pergunta *</label>
            <textarea
              value={form.texto}
              onChange={e => set('texto', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Ex: Existe responsável técnico inscrito no CRF?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Resposta</label>
              <select value={form.tipo_resposta} onChange={e => set('tipo_resposta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {Object.entries(TIPO_RESPOSTA_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input type="checkbox" checked={form.obrigatoria} onChange={e => set('obrigatoria', e.target.checked)}
                  className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Obrigatória</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referência Legal</label>
            <input value={form.referencia_legal} onChange={e => set('referencia_legal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Art.15 da lei Federal 5991/73" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
            {item ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== APP PRINCIPAL ====================

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('estabelecimentos');

  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [roteiros, setRoteiros] = useState([]);
  const [inspecoes, setInspecoes] = useState([]);

  const [modal, setModal] = useState(null); // null | 'novo' | 'editar' | 'excluir'
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewingInspecao, setViewingInspecao] = useState(null);
  const [modalRoteiro, setModalRoteiro] = useState(null);
  const [gerenciandoSecoes, setGerenciandoSecoes] = useState(null); // roteiro selecionado // null | 'form'
  const [selectedRoteiro, setSelectedRoteiro] = useState(null);
  const [toast, setToast] = useState(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('visatech_token');
    if (savedToken) { setToken(savedToken); verifyToken(savedToken); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, activeTab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeaders = (tkn) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tkn || token}`
  });

  const verifyToken = async (tkn) => {
    try {
      const r = await fetch(`${API_URL}/estabelecimentos`, { headers: authHeaders(tkn) });
      if (r.ok) {
        setIsAuthenticated(true);
        setUser(JSON.parse(atob(tkn.split('.')[1])));
      } else handleLogout();
    } catch { handleLogout(); }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return alert('Preencha email e senha');
    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (r.ok) {
        const data = await r.json();
        localStorage.setItem('visatech_token', data.token);
        setToken(data.token); setUser(data.user); setIsAuthenticated(true);
        setLoginEmail(''); setLoginPassword('');
      } else alert('Credenciais inválidas');
    } catch (e) { alert('Erro ao fazer login: ' + e.message); }
  };

  const handleLogout = () => {
    localStorage.removeItem('visatech_token');
    setToken(null); setIsAuthenticated(false); setUser(null);
  };

  const loadData = async () => {
    if (!token) return;
    try {
      if (activeTab === 'estabelecimentos') {
        const r = await fetch(`${API_URL}/estabelecimentos`, { headers: authHeaders() });
        setEstabelecimentos(await r.json());
      } else if (activeTab === 'roteiros') {
        const r = await fetch(`${API_URL}/questionarios`, { headers: authHeaders() });
        setRoteiros(await r.json());
      } else if (activeTab === 'inspecoes') {
        const r = await fetch(`${API_URL}/inspecoes`, { headers: authHeaders() });
        setInspecoes(await r.json());
      }
    } catch (e) { console.error(e); }
  };

  // ---- CRUD Estabelecimentos ----

  const salvarEstabelecimento = async (form) => {
    try {
      const isEdit = !!selectedItem;
      const url = isEdit
        ? `${API_URL}/estabelecimentos/${selectedItem.id}`
        : `${API_URL}/estabelecimentos`;
      const r = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      if (r.ok) {
        showToast(isEdit ? 'Estabelecimento atualizado!' : 'Estabelecimento cadastrado!');
        setModal(null); setSelectedItem(null);
        loadData();
      } else {
        const err = await r.json();
        showToast(err.error || 'Erro ao salvar', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
  };

  const excluirEstabelecimento = async () => {
    try {
      const r = await fetch(`${API_URL}/estabelecimentos/${selectedItem.id}`, {
        method: 'DELETE', headers: authHeaders()
      });
      if (r.ok) {
        showToast('Estabelecimento excluído!');
        setModal(null); setSelectedItem(null);
        loadData();
      } else {
        showToast('Erro ao excluir', 'error');
      }
    } catch {
      showToast('Erro de conexão', 'error');
    }
  };

  const salvarRoteiro = async (form) => {
    try {
      const isEdit = !!selectedRoteiro;
      const url = isEdit ? `${API_URL}/questionarios/${selectedRoteiro.id}` : `${API_URL}/questionarios`;
      const r = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      if (r.ok) {
        showToast(isEdit ? 'Roteiro atualizado!' : 'Roteiro criado!');
        setModalRoteiro(null); setSelectedRoteiro(null);
        loadData();
      } else {
        const err = await r.json();
        showToast(err.error || 'Erro ao salvar', 'error');
      }
    } catch { showToast('Erro de conexão', 'error'); }
  };

  const excluirRoteiro = async (id) => {
    if (!window.confirm('Desativar este roteiro?')) return;
    try {
      const r = await fetch(`${API_URL}/questionarios/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { showToast('Roteiro desativado!'); loadData(); }
      else showToast('Erro ao desativar', 'error');
    } catch { showToast('Erro de conexão', 'error'); }
  };

  const verInspecao = async (id) => {
    try {
      const r = await fetch(`${API_URL}/inspecoes/${id}`, { headers: authHeaders() });
      setViewingInspecao(await r.json());
    } catch (e) { alert('Erro ao carregar inspeção'); }
  };

  // ==================== LOGIN ====================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">VISATech</h1>
            <p className="text-gray-500 mt-1">Painel Administrativo</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="admin@visatech.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••" />
            </div>
            <button onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PAINEL ====================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">VISATech Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'estabelecimentos', label: 'Estabelecimentos', icon: Building2 },
              { key: 'roteiros', label: 'Roteiros', icon: FileText },
              { key: 'inspecoes', label: 'Inspeções', icon: ClipboardList },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm font-medium ${
                  activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ===== ESTABELECIMENTOS ===== */}
        {activeTab === 'estabelecimentos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Estabelecimentos</h2>
                <p className="text-sm text-gray-500 mt-1">{estabelecimentos.length} cadastrado(s)</p>
              </div>
              <button
                onClick={() => { setSelectedItem(null); setModal('form'); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                <Plus size={18} /> Novo Estabelecimento
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estabelecimento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CNPJ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {estabelecimentos.map((est) => (
                    <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{est.razao_social}</div>
                        {est.nome_fantasia && <div className="text-sm text-gray-500">{est.nome_fantasia}</div>}
                        {est.endereco && <div className="text-xs text-gray-400 mt-0.5">{est.endereco}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{est.cnpj}</td>
                      <td className="px-6 py-4">
                        {est.telefone && <div className="text-sm text-gray-600">{est.telefone}</div>}
                        {est.email && <div className="text-xs text-gray-400">{est.email}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${est.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {est.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedItem(est); setModal('form'); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(est); setModal('excluir'); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {estabelecimentos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Nenhum estabelecimento cadastrado</p>
                        <p className="text-gray-300 text-sm mt-1">Clique em "Novo Estabelecimento" para começar</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ROTEIROS ===== */}
        {activeTab === 'roteiros' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Roteiros de Inspeção</h2>
                <p className="text-sm text-gray-500 mt-1">{roteiros.length} roteiro(s) cadastrado(s)</p>
              </div>
              <button
                onClick={() => { setSelectedRoteiro(null); setModalRoteiro('form'); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                <Plus size={18} /> Novo Roteiro
              </button>
            </div>
            <div className="grid gap-4">
              {roteiros.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{r.titulo}</h3>
                      {r.descricao && <p className="text-sm text-gray-500 mt-1">{r.descricao}</p>}

                      {/* Estabelecimento vinculado */}
                      {r.estabelecimento_nome && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg w-fit">
                          <Building2 size={14} className="text-blue-500" />
                          <span className="text-xs text-blue-700 font-medium">
                            {r.estabelecimento_fantasia || r.estabelecimento_nome}
                          </span>
                          {r.estabelecimento_cnpj && (
                            <span className="text-xs text-blue-400">— {r.estabelecimento_cnpj}</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 flex-wrap">
                        {r.versao && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">v{r.versao}</span>}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{r.total_secoes || 0} seções</span>
                        {r.tipo && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">{r.tipo.replace(/_/g, ' ')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => { setSelectedRoteiro(r); setModalRoteiro('form'); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setGerenciandoSecoes(r)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Gerenciar Seções">
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => excluirRoteiro(r.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Desativar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {roteiros.length === 0 && (
                <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                  <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">Nenhum roteiro cadastrado</p>
                  <p className="text-gray-300 text-sm mt-1">Clique em "Novo Roteiro" para começar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== INSPEÇÕES ===== */}
        {activeTab === 'inspecoes' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Inspeções Realizadas</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estabelecimento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fiscal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inspecoes.map((insp) => (
                    <tr key={insp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{insp.razao_social}</div>
                        {insp.nome_fantasia && <div className="text-xs text-gray-400">{insp.nome_fantasia}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{insp.fiscal_nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(insp.data_inicio).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          insp.status === 'FINALIZADA' ? 'bg-green-100 text-green-700' :
                          insp.status === 'CANCELADA' || insp.status === 'BLOQUEADA_B' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {insp.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => verInspecao(insp.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inspecoes.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">Nenhuma inspeção realizada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}
      {gerenciandoSecoes && (
        <GerenciarSecoes
          roteiro={gerenciandoSecoes}
          token={token}
          onClose={() => setGerenciandoSecoes(null)}
        />
      )}

      {modalRoteiro === 'form' && (
        <ModalRoteiro
          item={selectedRoteiro}
          estabelecimentos={estabelecimentos}
          onSave={salvarRoteiro}
          onClose={() => { setModalRoteiro(null); setSelectedRoteiro(null); }}
        />
      )}
      {modal === 'form' && (
        <ModalEstabelecimento
          item={selectedItem}
          onSave={salvarEstabelecimento}
          onClose={() => { setModal(null); setSelectedItem(null); }}
        />
      )}

      {modal === 'excluir' && selectedItem && (
        <ModalConfirmar
          nome={selectedItem.nome_fantasia || selectedItem.razao_social}
          onConfirm={excluirEstabelecimento}
          onClose={() => { setModal(null); setSelectedItem(null); }}
        />
      )}

      {/* Modal Ver Inspeção */}
      {viewingInspecao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Relatório de Inspeção #{viewingInspecao.id}</h3>
              <button onClick={() => setViewingInspecao(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={22} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
              <div><span className="font-semibold">Estabelecimento:</span> {viewingInspecao.razao_social}</div>
              <div><span className="font-semibold">CNPJ:</span> {viewingInspecao.cnpj}</div>
              <div><span className="font-semibold">Fiscal:</span> {viewingInspecao.fiscal_nome}</div>
              <div><span className="font-semibold">Data:</span> {new Date(viewingInspecao.data_inicio).toLocaleString('pt-BR')}</div>
              <div>
                <span className="font-semibold">Status: </span>
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                  viewingInspecao.status === 'FINALIZADA' ? 'bg-green-100 text-green-700' :
                  viewingInspecao.status === 'BLOQUEADA_B' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{viewingInspecao.status}</span>
              </div>
              {viewingInspecao.questionario_titulo && (
                <div><span className="font-semibold">Roteiro:</span> {viewingInspecao.questionario_titulo}</div>
              )}
            </div>
            <h4 className="font-semibold text-base mb-3 border-t pt-4">Respostas por Seção</h4>
            {['A','B','C','D','E','F','G','H'].map(s => {
              const rs = viewingInspecao.respostas?.filter(r => r.secao_codigo === s) || [];
              if (!rs.length) return null;
              return (
                <div key={s} className="mb-4">
                  <h5 className="font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm">Seção {s}</h5>
                  <div className="space-y-2 mt-2">
                    {rs.map(r => (
                      <div key={r.id} className="border-l-4 border-blue-200 pl-4 py-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium text-gray-800">{r.pergunta_texto}</div>
                        <div className="mt-1 flex items-center gap-2">
                          {r.resposta_opcao && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              r.resposta_opcao === 'SIM' ? 'bg-green-100 text-green-700' :
                              r.resposta_opcao === 'NAO' ? 'bg-red-100 text-red-700' :
                              r.resposta_opcao === 'NA' ? 'bg-gray-100 text-gray-600' :
                              'bg-orange-100 text-orange-700'
                            }`}>{r.resposta_opcao === 'NAO' ? 'NÃO' : r.resposta_opcao}</span>
                          )}
                          {r.resposta_texto && <span className="text-gray-700">{r.resposta_texto}</span>}
                        </div>
                        {r.observacao && <div className="mt-1 text-xs text-gray-500 italic">Obs: {r.observacao}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button onClick={() => setViewingInspecao(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import { useState, useEffect, useCallback } from 'react';
import { LogOut, Building2, ClipboardList, Plus, X, Edit2, Trash2, Check,
         AlertTriangle, Eye, Search, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = 'https://visatech-backend.onrender.com/api';

// ============================================================
// HELPERS
// ============================================================

const formatCNPJ = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
           .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3/$4')
           .replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3')
           .replace(/^(\d{2})(\d{3})$/, '$1.$2')
           .replace(/^(\d{2})$/, '$1');
};

const formatTel = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return d;
};

const STATUS_LABEL = {
  EM_ANDAMENTO: { label: 'Em andamento', cls: 'bg-blue-100 text-blue-700' },
  BLOQUEADA_B:  { label: 'Bloqueada (B)', cls: 'bg-red-100 text-red-700' },
  FINALIZADA:   { label: 'Finalizada', cls: 'bg-green-100 text-green-700' },
  CANCELADA:    { label: 'Cancelada', cls: 'bg-gray-100 text-gray-500' },
};

// ============================================================
// TOAST
// ============================================================

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-white font-medium text-sm
      ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      {toast.msg}
    </div>
  );
}

// ============================================================
// MODAL ESTABELECIMENTO
// ============================================================

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

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: null })); };

  const validate = () => {
    const e = {};
    if (!form.razao_social.trim()) e.razao_social = 'Obrigatório';
    if (!form.cnpj.trim()) e.cnpj = 'Obrigatório';
    else if (form.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'CNPJ inválido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{item ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={22} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {[
            { f: 'razao_social', label: 'Razão Social *', ph: 'Nome jurídico' },
            { f: 'nome_fantasia', label: 'Nome Fantasia', ph: 'Nome comercial' },
            { f: 'endereco', label: 'Endereço', ph: 'Rua, número, bairro...' },
            { f: 'email', label: 'Email', ph: 'contato@drogaria.com' },
          ].map(({ f, label, ph }) => (
            <div key={f}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input value={form[f]} onChange={e => set(f, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none
                  ${errors[f] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                placeholder={ph} />
              {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <input value={form.cnpj} onChange={e => set('cnpj', formatCNPJ(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none
                  ${errors.cnpj ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                placeholder="00.000.000/0000-00" />
              {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input value={form.telefone} onChange={e => set('telefone', formatTel(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="(00) 00000-0000" />
            </div>
          </div>
          {item && (
            <div className="flex items-center gap-3">
              <button onClick={() => set('ativo', !form.ativo)}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.ativo ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ativo ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${form.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                {form.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
            {item ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETALHE DA INSPEÇÃO
// ============================================================

const SECOES_INFO = {
  A: 'Identificação',
  B: 'Responsabilidade Técnica',
  C: 'Administração',
  D: 'Edificação e Instalações',
  E: 'Armazenagem e Exposição',
  F: 'Produtos',
  G: 'Serviços Farmacêuticos',
  H: 'Controle Especial',
};

function DetalheInspecao({ inspecao, onClose }) {
  const [expandida, setExpandida] = useState(null);
  const resp = inspecao.respostas || {};
  const st = STATUS_LABEL[inspecao.status] || STATUS_LABEL.EM_ANDAMENTO;

  const secoesComRespostas = Object.keys(SECOES_INFO).filter(s => resp[s] && Object.keys(resp[s]).length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {inspecao.nome_fantasia || inspecao.razao_social || 'Inspeção #' + inspecao.id}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
              <span className="text-xs text-gray-400">{inspecao.cnpj}</span>
              {inspecao.fiscal_nome && <span className="text-xs text-gray-400">Fiscal: {inspecao.fiscal_nome}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Dados do estabelecimento */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Estabelecimento</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div><span className="text-gray-500">Razão Social:</span> <span className="font-medium">{inspecao.razao_social || '—'}</span></div>
              <div><span className="text-gray-500">CNPJ:</span> <span className="font-medium">{inspecao.cnpj || '—'}</span></div>
              {inspecao.endereco && <div className="col-span-2"><span className="text-gray-500">Endereço:</span> <span className="font-medium">{inspecao.endereco}</span></div>}
            </div>
          </div>

          {/* Seções com respostas */}
          {secoesComRespostas.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Nenhuma resposta registrada ainda.</p>
          ) : (
            secoesComRespostas.map(secao => (
              <div key={secao} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandida(expandida === secao ? null : secao)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">{secao}</span>
                    <span className="font-semibold text-gray-700 text-sm">{SECOES_INFO[secao]}</span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {Object.keys(resp[secao]).length} campo(s)
                    </span>
                  </div>
                  {expandida === secao ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {expandida === secao && (
                  <div className="p-4 space-y-2">
                    {Object.entries(resp[secao]).map(([campo, valor]) => (
                      <div key={campo} className="flex items-start gap-2 text-sm">
                        <span className="text-gray-500 min-w-[180px] text-xs">{campo.replace(/_/g, ' ')}:</span>
                        <span className={`font-medium ${valor === 'SIM' ? 'text-green-600' : valor === 'NAO' ? 'text-red-600' : 'text-gray-800'}`}>
                          {valor || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Inventário H */}
          {(inspecao.inventario?.length > 0) && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50 flex items-center gap-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">H</span>
                <span className="font-semibold text-gray-700 text-sm">Inventário de Medicamentos</span>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="text-left pb-2">Medicamento</th>
                      <th className="text-center pb-2">Estoque Físico</th>
                      <th className="text-center pb-2">Estoque Escriturado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspecao.inventario.map((it, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5">{it.medicamento}</td>
                        <td className="text-center">{it.estoque_fisico ?? '—'}</td>
                        <td className="text-center">{it.estoque_escrit ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium">Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('visatech_token'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('inspecoes');
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [inspecoes, setInspecoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [selectedEstab, setSelectedEstab] = useState(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState(null);
  const [viewingInsp, setViewingInsp] = useState(null);

  const { toast, show: showToast } = useToast();

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  // ── Carrega dados ──
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [estRes, inspRes] = await Promise.all([
        fetch(`${API_URL}/estabelecimentos`, { headers: authHeaders() }),
        fetch(`${API_URL}/inspecoes`, { headers: authHeaders() }),
      ]);
      if (estRes.ok) setEstabelecimentos(await estRes.json());
      if (inspRes.ok) setInspecoes(await inspRes.json());
    } catch { showToast('Erro ao carregar dados', 'error'); }
    setLoading(false);
  }, [token, authHeaders, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Login ──
  const handleLogin = async () => {
    setLoginLoading(true); setLoginError('');
    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await r.json();
      if (r.ok) {
        localStorage.setItem('visatech_token', data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Credenciais inválidas');
      }
    } catch { setLoginError('Erro de conexão'); }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('visatech_token');
    setToken(null);
  };

  // ── CRUD Estabelecimentos ──
  const salvarEstabelecimento = async (form) => {
    try {
      const isEdit = !!selectedEstab;
      const url = isEdit ? `${API_URL}/estabelecimentos/${selectedEstab.id}` : `${API_URL}/estabelecimentos`;
      const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(form) });
      if (r.ok) {
        showToast(isEdit ? 'Estabelecimento atualizado!' : 'Estabelecimento cadastrado!');
        setModal(null); setSelectedEstab(null); loadData();
      } else {
        const e = await r.json(); showToast(e.error || 'Erro ao salvar', 'error');
      }
    } catch { showToast('Erro de conexão', 'error'); }
  };

  const excluirEstabelecimento = async (id) => {
    try {
      const r = await fetch(`${API_URL}/estabelecimentos/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { showToast('Estabelecimento desativado!'); loadData(); }
      else showToast('Erro ao desativar', 'error');
    } catch { showToast('Erro de conexão', 'error'); }
    setConfirmarExcluir(null);
  };

  // ── Ver detalhes inspeção ──
  const verInspecao = async (id) => {
    try {
      const r = await fetch(`${API_URL}/inspecoes/${id}`, { headers: authHeaders() });
      if (r.ok) setViewingInsp(await r.json());
      else showToast('Erro ao carregar inspeção', 'error');
    } catch { showToast('Erro de conexão', 'error'); }
  };

  // ── Cancelar inspeção ──
  const cancelarInspecao = async (id) => {
    if (!window.confirm('Cancelar esta inspeção?')) return;
    try {
      const r = await fetch(`${API_URL}/inspecoes/${id}/cancelar`, { method: 'PUT', headers: authHeaders() });
      if (r.ok) { showToast('Inspeção cancelada'); loadData(); }
      else showToast('Erro ao cancelar', 'error');
    } catch { showToast('Erro de conexão', 'error'); }
  };

  // ── LOGIN SCREEN ──
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">VISATech</h1>
            <p className="text-gray-500 mt-1">Painel Administrativo</p>
          </div>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{loginError}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="seu@email.com" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••" type="password" />
            </div>
            <button onClick={handleLogin} disabled={loginLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loginLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN ──
  const tabs = [
    { key: 'inspecoes',      label: 'Inspeções',       icon: ClipboardList },
    { key: 'estabelecimentos', label: 'Estabelecimentos', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardList size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">VISATech</span>
          </div>
          <nav className="flex gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── ABA INSPEÇÕES ── */}
        {activeTab === 'inspecoes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Inspeções</h2>
                <p className="text-sm text-gray-500 mt-1">{inspecoes.length} inspeção(ões) registrada(s)</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : inspecoes.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhuma inspeção registrada</p>
                <p className="text-gray-300 text-sm mt-1">As inspeções são criadas pelo app mobile</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-xs font-semibold text-gray-500 uppercase">
                      <th className="text-left px-4 py-3">Estabelecimento</th>
                      <th className="text-left px-4 py-3">CNPJ</th>
                      <th className="text-left px-4 py-3">Fiscal</th>
                      <th className="text-left px-4 py-3">Data</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-center px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inspecoes.map(i => {
                      const st = STATUS_LABEL[i.status] || STATUS_LABEL.EM_ANDAMENTO;
                      return (
                        <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 text-sm">{i.nome_fantasia || i.razao_social || '—'}</p>
                            {i.nome_fantasia && <p className="text-xs text-gray-400">{i.razao_social}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{i.cnpj || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{i.fiscal_nome || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(i.criado_em).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => verInspecao(i.id)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Ver detalhes">
                                <Eye size={15} />
                              </button>
                              {!['FINALIZADA','CANCELADA'].includes(i.status) && (
                                <button onClick={() => cancelarInspecao(i.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Cancelar">
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ABA ESTABELECIMENTOS ── */}
        {activeTab === 'estabelecimentos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Estabelecimentos</h2>
                <p className="text-sm text-gray-500 mt-1">{estabelecimentos.length} cadastrado(s)</p>
              </div>
              <button onClick={() => { setSelectedEstab(null); setModal('estab'); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">
                <Plus size={18} /> Novo Estabelecimento
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : estabelecimentos.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhum estabelecimento cadastrado</p>
                <p className="text-gray-300 text-sm mt-1">Clique em "Novo Estabelecimento" para começar</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-xs font-semibold text-gray-500 uppercase">
                      <th className="text-left px-4 py-3">Estabelecimento</th>
                      <th className="text-left px-4 py-3">CNPJ</th>
                      <th className="text-left px-4 py-3">Contato</th>
                      <th className="text-center px-4 py-3">Status</th>
                      <th className="text-center px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estabelecimentos.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm">{e.nome_fantasia || e.razao_social}</p>
                          {e.nome_fantasia && <p className="text-xs text-gray-400">{e.razao_social}</p>}
                          {e.endereco && <p className="text-xs text-gray-400 mt-0.5">{e.endereco}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.cnpj}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {e.telefone && <p>{e.telefone}</p>}
                          {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                            ${e.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {e.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setSelectedEstab(e); setModal('estab'); }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => setConfirmarExcluir(e)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Desativar">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}

      {modal === 'estab' && (
        <ModalEstabelecimento
          item={selectedEstab}
          onSave={salvarEstabelecimento}
          onClose={() => { setModal(null); setSelectedEstab(null); }}
        />
      )}

      {confirmarExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Desativar estabelecimento?</h3>
                <p className="text-sm text-gray-500 mt-0.5">{confirmarExcluir.razao_social}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium">Cancelar</button>
              <button onClick={() => excluirEstabelecimento(confirmarExcluir.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Desativar</button>
            </div>
          </div>
        </div>
      )}

      {viewingInsp && (
        <DetalheInspecao inspecao={viewingInsp} onClose={() => setViewingInsp(null)} />
      )}
    </div>
  );
}
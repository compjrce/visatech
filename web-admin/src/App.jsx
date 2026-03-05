import React, { useState, useEffect } from 'react';
import { LogOut, Building2, FileText, ClipboardList, Plus, Eye, X, Edit2, Trash2, Check, AlertTriangle } from 'lucide-react';

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
              <h2 className="text-2xl font-bold text-gray-800">Roteiros de Inspeção</h2>
            </div>
            <div className="grid gap-4">
              {roteiros.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{r.titulo}</h3>
                      {r.descricao && <p className="text-sm text-gray-500 mt-1">{r.descricao}</p>}
                      <div className="flex gap-3 mt-2">
                        {r.versao && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">v{r.versao}</span>}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{r.total_secoes || 0} seções</span>
                        {r.tipo && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">{r.tipo}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {roteiros.length === 0 && (
                <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                  <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum roteiro cadastrado</p>
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
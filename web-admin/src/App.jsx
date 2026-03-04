import React, { useState, useEffect } from 'react';
import { LogOut, Building2, FileText, ClipboardList, Settings, Users, Plus, Edit2, Trash2, Eye, X, ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = 'https://visatech-backend.onrender.com/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('estabelecimentos');
  
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [roteiros, setRoteiros] = useState([]);
  const [inspecoes, setInspecoes] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingInspecao, setViewingInspecao] = useState(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const savedToken = localStorage.getItem('visatech_token');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const verifyToken = async (tkn) => {
    try {
      const response = await fetch(`${API_URL}/estabelecimentos`, {
        headers: { 'Authorization': `Bearer ${tkn}` }
      });
      if (response.ok) {
        setIsAuthenticated(true);
        const userData = JSON.parse(atob(tkn.split('.')[1]));
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Preencha email e senha');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('visatech_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('visatech_token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const loadData = async () => {
    if (!token) return;
    
    try {
      if (activeTab === 'estabelecimentos') {
        const response = await fetch(`${API_URL}/estabelecimentos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setEstabelecimentos(data);
      } else if (activeTab === 'roteiros') {
        const response = await fetch(`${API_URL}/questionarios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setRoteiros(data);
      } else if (activeTab === 'inspecoes') {
        const response = await fetch(`${API_URL}/inspecoes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setInspecoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const verInspecao = async (id) => {
    try {
      const response = await fetch(`${API_URL}/inspecoes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setViewingInspecao(data);
    } catch (error) {
      alert('Erro ao carregar inspeção: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">VISATech</h1>
            <p className="text-gray-600 mt-2">Painel Administrativo</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@visatech.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">VISATech Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            {['estabelecimentos', 'roteiros', 'inspecoes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'estabelecimentos' && <Building2 size={20} />}
                {tab === 'roteiros' && <FileText size={20} />}
                {tab === 'inspecoes' && <ClipboardList size={20} />}
                {tab === 'estabelecimentos' && 'Estabelecimentos'}
                {tab === 'roteiros' && 'Roteiros de Inspeção'}
                {tab === 'inspecoes' && 'Inspeções Realizadas'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'estabelecimentos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Estabelecimentos</h2>
              {user?.role === 'admin' && (
                <button
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Novo Estabelecimento
                </button>
              )}
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Razão Social</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome Fantasia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estabelecimentos.map((est) => (
                    <tr key={est.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{est.razao_social}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{est.nome_fantasia}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{est.cnpj}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roteiros' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Roteiros de Inspeção</h2>
              {user?.role === 'admin' && (
                <button
                  onClick={() => alert('Use o SQL para criar roteiros por enquanto')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Novo Roteiro
                </button>
              )}
            </div>
            <div className="grid gap-4">
              {roteiros.map((roteiro) => (
                <div key={roteiro.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{roteiro.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">{roteiro.descricao}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Versão: {roteiro.versao}</span>
                        <span>•</span>
                        <span>{roteiro.total_secoes || 0} seções</span>
                        <span>•</span>
                        <span className="text-blue-600">{roteiro.tipo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inspecoes' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Inspeções Realizadas</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estabelecimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inspecoes.map((insp) => (
                    <tr key={insp.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{insp.razao_social}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{insp.fiscal_nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(insp.data_inicio).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          insp.status === 'FINALIZADA' ? 'bg-green-100 text-green-800' :
                          insp.status === 'BLOQUEADA_B' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {insp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => verInspecao(insp.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {viewingInspecao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Relatório de Inspeção</h3>
              <button onClick={() => setViewingInspecao(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">Estabelecimento:</span> {viewingInspecao.razao_social}</div>
                <div><span className="font-semibold">CNPJ:</span> {viewingInspecao.cnpj}</div>
                <div><span className="font-semibold">Fiscal:</span> {viewingInspecao.fiscal_nome}</div>
                <div><span className="font-semibold">Data:</span> {new Date(viewingInspecao.data_inicio).toLocaleString('pt-BR')}</div>
                <div><span className="font-semibold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    viewingInspecao.status === 'FINALIZADA' ? 'bg-green-100 text-green-800' :
                    viewingInspecao.status === 'BLOQUEADA_B' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingInspecao.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-lg mb-3">Respostas por Seção:</h4>
              
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(secao => {
                const respostasSecao = viewingInspecao.respostas?.filter(r => r.secao_codigo === secao) || [];
                if (respostasSecao.length === 0) return null;

                return (
                  <div key={secao} className="mb-4">
                    <h5 className="font-semibold bg-blue-50 p-2 rounded">Seção {secao}</h5>
                    <div className="space-y-2 mt-2">
                      {respostasSecao.map((resp, idx) => (
                        <div key={resp.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                          <div className="font-medium text-sm">{resp.pergunta_texto}</div>
                          <div className="mt-1">
                            {resp.resposta_opcao && (
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                resp.resposta_opcao === 'SIM' ? 'bg-green-100 text-green-800' :
                                resp.resposta_opcao === 'NAO' ? 'bg-red-100 text-red-800' :
                                resp.resposta_opcao === 'NA' ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {resp.resposta_opcao}
                              </span>
                            )}
                            {resp.resposta_texto && (
                              <span className="text-sm text-gray-700">{resp.resposta_texto}</span>
                            )}
                          </div>
                          {resp.observacao && (
                            <div className="mt-2 text-sm text-gray-600 italic">Obs: {resp.observacao}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {viewingInspecao.inventario && viewingInspecao.inventario.length > 0 && (
                <div className="mt-6">
                  <h5 className="font-semibold bg-purple-50 p-2 rounded">Inventário de Medicamentos</h5>
                  <table className="min-w-full mt-2">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicamento</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Estoque Físico</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Estoque Escriturado</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {viewingInspecao.inventario.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm">{item.medicamento}</td>
                          <td className="px-4 py-2 text-sm">{item.estoque_fisico}</td>
                          <td className="px-4 py-2 text-sm">{item.estoque_escriturado}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.observacao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewingInspecao(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
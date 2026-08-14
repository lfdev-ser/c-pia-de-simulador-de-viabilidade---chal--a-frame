import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCheck, UserX, Search, ArrowLeft, Loader2, ShieldCheck, Mail, Trash2, Settings, User, Award } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { SponsorsAdminPanel } from './SponsorsAdminPanel';

interface AdminDashboardPageProps {
  onBackToSimulator: () => void;
  currentUser: { id?: number; name?: string | null; email?: string | null; role: string };
}

export function AdminDashboardPage({ onBackToSimulator, currentUser }: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'sponsors' | 'profile'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  
  // Profile update states
  const [newEmail, setNewEmail] = useState(currentUser.email || '');

  const usersQuery = trpc.admin.listUsers.useQuery(undefined, { retry: false });
  const updateRoleMutation = trpc.admin.updateRole.useMutation();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const updateEmailMutation = trpc.admin.updateEmail.useMutation();
  const utils = trpc.useUtils();

  const handleRoleChange = async (userId: number, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      await utils.admin.listUsers.invalidate();
      toast.success(`Permissão atualizada para ${newRole.toUpperCase()} com sucesso.`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar permissão do usuário.');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação removerá todas as simulações e dados associados.`)) {
      return;
    }
    try {
      await deleteUserMutation.mutateAsync({ userId });
      await utils.admin.listUsers.invalidate();
      toast.success('Usuário excluído com sucesso.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário.');
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Informe um e-mail válido.');
      return;
    }
    try {
      await updateEmailMutation.mutateAsync({ newEmail });
      toast.success('E-mail atualizado com sucesso! Recarregue a página se necessário.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar e-mail.');
    }
  };

  const users = usersQuery.data ?? [];

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (roleFilter === 'all') return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u: any) => u.role === 'admin').length;
  const verifiedCount = users.filter((u: any) => u.emailVerified === 1).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-400 border border-purple-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Painel Administrativo Geral
            </h1>
            <p className="text-xs text-slate-400">Gerenciamento completo da plataforma, usuários e configurações</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400">Logado como Admin</p>
            <p className="text-sm font-bold text-slate-200">{currentUser.name || currentUser.email}</p>
          </div>
          <Button
            variant="default"
            onClick={onBackToSimulator}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-sm shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Simulador
          </Button>
        </div>
      </header>

      {/* Navigation Subheader / Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-2 flex flex-wrap items-center gap-4 shadow-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Users className="w-4 h-4" /> Gerenciar Usuários
        </button>
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'sponsors' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Award className="w-4 h-4" /> Patrocinadores & Banners
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Settings className="w-4 h-4" /> Meu Perfil & E-mail
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'sponsors' ? (
          <SponsorsAdminPanel />
        ) : activeTab === 'profile' ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-white border-slate-200 shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Gerenciar E-mail e Credenciais do Administrador
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Atualize seu e-mail de acesso ou cadastre uma senha segura protegida com hash criptográfico.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">E-mail Administrativo</label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateEmailMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 text-xs"
                    >
                      {updateEmailMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Salvar E-mail
                    </Button>
                  </div>
                </form>

                <hr className="border-slate-100" />

                <AdminPasswordChangeSection userId={currentUser.id} />
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'users' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="bg-white border-slate-200 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600">Total de Cadastros</CardTitle>
                  <Users className="w-5 h-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900">{totalUsers}</div>
                  <p className="text-xs text-slate-500 mt-1">Usuários registrados no banco de dados</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600">Administradores</CardTitle>
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900">{adminCount}</div>
                  <p className="text-xs text-slate-500 mt-1">Contas com privilégios gerenciais</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-xs sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600">E-mails Confirmados</CardTitle>
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900">{verifiedCount} / {totalUsers}</div>
                  <p className="text-xs text-slate-500 mt-1">Contas ativas e verificadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Users Management Section */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Listagem e Controle de Usuários</CardTitle>
                  <p className="text-xs text-slate-500">Filtre cadastros, altere cargos ou remova contas quando necessário.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-end sm:self-auto">
                    <button
                      onClick={() => setRoleFilter('all')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setRoleFilter('admin')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${roleFilter === 'admin' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Admins
                    </button>
                    <button
                      onClick={() => setRoleFilter('user')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${roleFilter === 'user' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Usuários
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {usersQuery.isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4">Nome do Usuário</th>
                          <th className="py-3 px-4">E-mail</th>
                          <th className="py-3 px-4">Cargo</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                                {(u.name || u.email || 'U').charAt(0)}
                              </div>
                              <span>{u.name || 'Sem nome cadastrado'}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {u.email}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                                {u.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : null}
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {u.emailVerified === 1 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">
                                  <UserCheck className="w-3.5 h-3.5" /> Confirmado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold">
                                  <UserX className="w-3.5 h-3.5" /> Pendente
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleChange(u.id, u.role)}
                                disabled={updateRoleMutation.isPending}
                                className="border-slate-300 hover:bg-slate-100 font-medium text-xs"
                              >
                                {u.role === 'admin' ? 'Rebaixar' : 'Tornar Admin'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                disabled={deleteUserMutation.isPending || u.id === currentUser.id}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-semibold">Nenhum usuário encontrado</p>
                    <p className="text-xs text-slate-400">Tente ajustar sua busca ou o filtro de cargos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" /> Configurações de Perfil e E-mail
                </CardTitle>
                <p className="text-xs text-slate-500">Altere o endereço de e-mail associado à sua conta administrativa atual.</p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Novo Endereço de E-mail</label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="seu-novo-email@exemplo.com"
                      required
                      className="bg-slate-50"
                    />
                    <p className="text-xs text-slate-500">
                      O e-mail atual é <b>{currentUser.email}</b>. Certifique-se de inserir um endereço válido e acessível.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateEmailMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
                    >
                      {updateEmailMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Salvar Novo E-mail
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 Simulador Chalé A-frame ICF • Área Administrativa Restrita</p>
      </footer>
    </div>
  );
}

function AdminPasswordChangeSection({ userId }: { userId?: number }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const updatePasswordMutation = trpc.admin.updateAdminPassword.useMutation();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (!userId) {
      toast.error('ID do usuário não identificado.');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({ userId, newPassword });
      toast.success('Senha atualizada com segurança e criptografia scrypt!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha.');
    }
  };

  return (
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
      <h4 className="font-bold text-slate-900 text-sm">Definir Senha de Acesso (Admin)</h4>
      <div className="space-y-3">
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nova Senha</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-slate-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirmar Nova Senha</label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-slate-50"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={updatePasswordMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs"
        >
          {updatePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Cadastrar / Atualizar Senha
        </Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import AFrameSimulator from '@/components/AFrameSimulator';
import AFrameLogo from '@/components/AFrameLogo';
import { AdminPanel } from '@/components/AdminPanel';
import { getPasswordInputType } from '@/lib/passwordVisibility';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, User as UserIcon, LogOut, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Calculator, FileText } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register' | 'verify_pending'>('landing');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const utils = trpc.useUtils();

  // Verificar se há token de confirmação na URL (?verify=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify');
    if (verifyToken) {
      verifyEmailMutation.mutate({ token: verifyToken });
    }
  }, []);

  const verifyEmailMutation = trpc.authEmail.verifyEmail.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message);
      setAuthMode('login');
      window.history.replaceState({}, document.title, window.location.pathname);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao confirmar e-mail');
    }
  });

  const [debugVerificationToken, setDebugVerificationToken] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const registerMutation = trpc.authEmail.register.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message);
      if (data.verificationToken) {
        setDebugVerificationToken(data.verificationToken);
      }
      setAuthMode('verify_pending');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao realizar cadastro');
    }
  });

  const loginMutation = trpc.authEmail.login.useMutation({
    onSuccess: (data: any) => {
      if (!data.emailVerified) {
        setAuthMode('verify_pending');
        toast.error('Por favor, confirme seu e-mail antes de acessar.');
      } else {
        toast.success('Login realizado com sucesso!');
        utils.auth.me.invalidate();
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Credenciais inválidas');
    }
  });

  const resendMutation = trpc.authEmail.resendVerification.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message);
      if (data.verificationToken) {
        setDebugVerificationToken(data.verificationToken);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao reenviar e-mail');
    }
  });

  // Se o usuário já estiver logado e com e-mail confirmado, exibe o simulador diretamente
  if (user && user.emailVerified === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3f0] to-[#faf8f3]">
        <div className="bg-white border-b border-[#e8e6e1] px-6 py-3 flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <AFrameLogo className="w-8 h-8 shrink-0" />
            <span className="font-bold text-lg text-[#2d2d2d]">Simulador Chalé A-frame ICF</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:inline">Olá, <b>{user.name || user.email}</b></span>
            {user.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminPanelOpen(true)}
                className="gap-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Painel Admin</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
        <AFrameSimulator />
        {user.role === 'admin' && (
          <AdminPanel open={adminPanelOpen} onOpenChange={setAdminPanelOpen} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3f0] to-[#e8e4db] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e8e6e1] bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <AFrameLogo className="w-9 h-9 shrink-0" />
          <span className="font-extrabold text-xl text-[#2d2d2d] tracking-tight">Chalé A-frame ICF</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setAuthMode('login')} className="font-semibold text-[#15803d]">
            Entrar
          </Button>
          <Button onClick={() => setAuthMode('register')} className="bg-[#15803d] hover:bg-[#166534] text-white font-semibold">
            Criar Conta Grátis
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        {authMode === 'landing' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#15803d]/10 text-[#15803d] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Tecnologia ICF & EPS de Alta Performance
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-[#2d2d2d] leading-tight">
                Simulador Profissional de Viabilidade para Chalés A-frame
              </h1>
              <p className="text-lg text-[#555555] leading-relaxed">
                Planeje sua obra com precisão milimétrica. Calcule área útil, otimize blocos EPS sem desperdício, estime o consumo de materiais, acabamento Iceflex e gere relatórios técnicos em PDF com gráficos avançados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={() => setAuthMode('register')} 
                  size="lg" 
                  className="bg-[#15803d] hover:bg-[#166534] text-white font-bold gap-2 text-base shadow-lg"
                >
                  Começar Gratuitamente <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => setAuthMode('login')} 
                  variant="outline" 
                  size="lg" 
                  className="font-bold border-[#15803d] text-[#15803d] hover:bg-[#15803d]/5 text-base"
                >
                  Já tenho uma conta
                </Button>
              </div>
              <div className="grid grid-cols-2 pt-6 border-t border-gray-200 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black text-[#15803d]">100%</p>
                  <p className="text-xs text-gray-500 font-medium">Conformidade EPS</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#15803d]">PDF</p>
                  <p className="text-xs text-gray-500 font-medium">Relatório Técnico</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e8e6e1] space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#15803d]/10 flex items-center justify-center text-[#15803d]">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2d2d2d]">Recursos do Simulador</h3>
                  <p className="text-xs text-gray-500">Planeje, compare e gere relatórios técnicos.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#15803d] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#2d2d2d]">Histórico de Comparações</h4>
                    <p className="text-xs text-gray-500">Salve e compare múltiplos cenários lado a lado com gráficos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#15803d] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#2d2d2d]">Otimização de EPS sem Cortes</h4>
                    <p className="text-xs text-gray-500">Evite desperdícios calculando múltiplos exatos de blocos (1.25m × 0.40m).</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setAuthMode('register')} 
                className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold py-3"
              >
                Criar sua conta agora
              </Button>
            </div>
          </div>
        )}

        {authMode === 'login' && (
          <Card className="max-w-md w-full p-8 rounded-3xl shadow-xl border border-[#e8e6e1] bg-white space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#2d2d2d]">Bem-vindo de volta</h2>
              <p className="text-sm text-gray-500">Entre com seu e-mail e senha cadastrados</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate({ email, password }); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    type={getPasswordInputType(showLoginPassword)} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 pr-10" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((visible) => !visible)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#15803d] transition-colors"
                    aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    title={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold py-3" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Entrando...' : 'Entrar na Plataforma'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button onClick={() => setAuthMode('register')} className="text-[#15803d] font-bold hover:underline">
                Cadastre-se grátis
              </button>
            </div>
            <div className="text-center">
              <button onClick={() => setAuthMode('landing')} className="text-xs text-gray-400 hover:text-gray-600">
                ← Voltar para a página inicial
              </button>
            </div>
          </Card>
        )}

        {authMode === 'register' && (
          <Card className="max-w-md w-full p-8 rounded-3xl shadow-xl border border-[#e8e6e1] bg-white space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#2d2d2d]">Criar sua Conta</h2>
              <p className="text-sm text-gray-500">Preencha os dados para acessar o simulador ICF</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); registerMutation.mutate({ name, email, password }); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Seu Nome" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    type={getPasswordInputType(showRegisterPassword)} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 pr-10" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((visible) => !visible)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#15803d] transition-colors"
                    aria-label={showRegisterPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    title={showRegisterPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold py-3" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Cadastrando...' : 'Cadastrar e Enviar Confirmação'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t text-sm text-gray-600">
              Já possui uma conta?{' '}
              <button onClick={() => setAuthMode('login')} className="text-[#15803d] font-bold hover:underline">
                Faça login
              </button>
            </div>
            <div className="text-center">
              <button onClick={() => setAuthMode('landing')} className="text-xs text-gray-400 hover:text-gray-600">
                ← Voltar para a página inicial
              </button>
            </div>
          </Card>
        )}

        {authMode === 'verify_pending' && (
          <Card className="max-w-md w-full p-8 rounded-3xl shadow-xl border border-amber-200 bg-amber-50/50 space-y-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Mail className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#2d2d2d]">Confirme seu E-mail</h2>
              <p className="text-sm text-gray-600">
                Enviamos um link de confirmação para o seu e-mail cadastrado. Clique no link recebido para ativar sua conta e liberar o acesso completo ao simulador.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <p className="font-semibold">Aviso de Produção:</p>
              <p>O link de ativação foi enviado para sua caixa de entrada. Verifique seu e-mail para ativar a conta antes de fazer o login.</p>
            </div>

            <div className="space-y-3">
              {debugVerificationToken && (
                <Button 
                  onClick={() => verifyEmailMutation.mutate({ token: debugVerificationToken })}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3"
                >
                  🚀 Ativar Conta Instantaneamente (Sandbox)
                </Button>
              )}
              <Button 
                onClick={() => resendMutation.mutate({ email })} 
                variant="outline" 
                className="w-full border-gray-300"
              >
                Reenviar E-mail de Confirmação
              </Button>
            </div>

            <div className="pt-2">
              <button onClick={() => setAuthMode('login')} className="text-sm text-[#15803d] font-bold hover:underline">
                Ir para a tela de login
              </button>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e6e1] bg-white py-6 text-center text-xs text-gray-500">
        <p>© 2026 Simulador Chalé A-frame ICF. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

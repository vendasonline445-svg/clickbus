import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      navigate('/');
    } else {
      toast({ title: 'Credenciais inválidas', description: 'Verifique usuário e senha.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full gradient-primary opacity-10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary">
              <Flame className="text-primary-foreground" size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Site<span className="text-primary">Cloner</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Clone qualquer site em segundos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Usuário</label>
              <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Digite seu usuário" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Digite sua senha" className="bg-secondary border-border pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11">
              Entrar
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

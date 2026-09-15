import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

/**
 * Componente AuthView para autenticación, registro y gestión de roles en Supabase
 */
export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  initialMode = 'login',
}) => {
  const { signIn, signUp, resetPassword, user, profile, isAdmin, signOut } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Si ya hay un usuario autenticado
  if (user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-[#FAF8F4] rounded-3xl border border-[#E6DFD4] shadow-lg text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#455546] text-[#FAF8F4] font-bold text-xl flex items-center justify-center mx-auto shadow-sm">
          {(profile?.fullName || user.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#3C4A3C] font-editorial">
            ¡Hola, {profile?.fullName || 'Anfitrión'}!
          </h2>
          <p className="text-xs text-[#7A8E77]">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAE5D9] text-[#455546]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B69C76]" />
            <span>Rol: {isAdmin ? '👑 Administrador' : 'Cliente Registrado'}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Por favor ingresa tu nombre completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
    }

    if (mode === 'login' && !password) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('¡Bienvenido(a) de nuevo!');
          if (onSuccess) onSuccess();
        }
      } else if (mode === 'register') {
        const { error, needsEmailConfirmation } = await signUp({
          email,
          password,
          fullName,
          phone,
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (needsEmailConfirmation) {
          setSuccessMessage(
            '¡Registro exitoso! Por favor verifica tu correo para confirmar tu cuenta.'
          );
        } else {
          setSuccessMessage('¡Cuenta creada e inicio de sesión completado!');
          if (onSuccess) onSuccess();
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage(
            'Se ha enviado un enlace de restablecimiento a tu correo.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error de conexión con Supabase Authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-[#FAF8F4] rounded-3xl border border-[#E6DFD4] shadow-xl">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5D9] text-[#455546] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
          <span>ICHIN By AMSI • Autenticación Supabase</span>
        </div>
        <h2 className="text-2xl font-bold font-editorial text-[#3C4A3C]">
          {mode === 'login' && 'Iniciar Sesión'}
          {mode === 'register' && 'Crear Cuenta'}
          {mode === 'forgot' && 'Recuperar Contraseña'}
        </h2>
      </div>

      {/* Tabs */}
      {mode !== 'forgot' && (
        <div className="flex bg-[#EAE5D9]/70 p-1 rounded-full mb-6 border border-[#E6DFD4]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'login'
                ? 'bg-[#455546] text-white shadow-xs'
                : 'text-[#525B4F] hover:text-[#3C4A3C]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'register'
                ? 'bg-[#455546] text-white shadow-xs'
                : 'text-[#525B4F] hover:text-[#3C4A3C]'
            }`}
          >
            Registrarse
          </button>
        </div>
      )}

      {/* Alerts */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ej. Valentina Mendoza"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
              Teléfono / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+58 414 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
              />
            </div>
          </div>
        )}

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77]">
                Contraseña
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[10px] text-[#B69C76] hover:underline font-bold"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
              />
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#B69C76]" />
              <span>Procesando con Supabase...</span>
            </>
          ) : (
            <>
              <span>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Crear Cuenta'}
                {mode === 'forgot' && 'Recuperar Contraseña'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B69C76]" />
            </>
          )}
        </button>
      </form>

      {mode === 'forgot' && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-xs text-[#7A8E77] hover:text-[#3C4A3C] font-bold"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
};

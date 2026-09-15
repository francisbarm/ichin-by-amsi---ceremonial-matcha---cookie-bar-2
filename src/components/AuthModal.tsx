import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  const translateAuthError = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid grant')) {
      return 'Correo o contraseña incorrectos. Por favor verifica tus datos.';
    }
    if (lower.includes('user already registered') || lower.includes('already exists')) {
      return 'Ya existe una cuenta con este correo. Inicia sesión en su lugar.';
    }
    if (lower.includes('password should be at least 6 characters')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (lower.includes('rate limit')) {
      return 'Demasiados intentos. Por favor espera unos minutos.';
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor introduce un correo electrónico válido.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Por favor introduce tu nombre completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('La contraseña debe tener un mínimo de 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
    }

    if (mode === 'login' && !password) {
      setErrorMessage('Por favor introduce tu contraseña.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(translateAuthError(error.message));
        } else {
          setSuccessMessage('¡Bienvenido(a) de vuelta!');
          setTimeout(() => {
            resetForm();
            onClose();
          }, 800);
        }
      } else if (mode === 'register') {
        const { error, needsEmailConfirmation } = await signUp({
          email,
          password,
          fullName,
          phone,
        });

        if (error) {
          setErrorMessage(translateAuthError(error.message));
        } else if (needsEmailConfirmation) {
          setSuccessMessage(
            '¡Cuenta creada con éxito! Revisa tu correo electrónico para confirmar tu registro y comenzar.'
          );
        } else {
          setSuccessMessage('¡Cuenta creada e inicio de sesión exitoso!');
          setTimeout(() => {
            resetForm();
            onClose();
          }, 1000);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMessage(translateAuthError(error.message));
        } else {
          setSuccessMessage(
            'Hemos enviado un enlace de recuperación a tu correo electrónico.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocurrió un error inesperado al conectar con Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#FAF8F4] rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-[#455546] via-[#B69C76] to-[#455546]" />

        {/* Close Button */}
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-[#3C4A3C] hover:bg-[#E6DFD4]/50 transition-colors"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="p-6 sm:p-8">
          
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5D9] text-[#455546] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>ICHIN By AMSI • Portal Anfitrión</span>
            </div>
            <h2 className="text-2xl font-bold font-editorial text-[#3C4A3C]">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta de Anfitrión'}
              {mode === 'forgot' && 'Recuperar Contraseña'}
            </h2>
            <p className="text-xs text-[#6A7869] mt-1 max-w-xs mx-auto">
              {mode === 'login' && 'Accede para gestionar tus cotizaciones, fechas reservadas y eventos exclusivos.'}
              {mode === 'register' && 'Regístrate para guardar tus presupuestos y recibir seguimiento personalizado.'}
              {mode === 'forgot' && 'Ingresa tu correo para recibir las instrucciones de recuperación.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-[#EAE5D9]/70 p-1 rounded-full mb-6 border border-[#E6DFD4]">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
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
                onClick={() => handleSwitchMode('register')}
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

          {/* Alert: Error */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Alert: Success */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name (Register only) */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                  />
                </div>
              </div>
            )}

            {/* Email */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                />
              </div>
            </div>

            {/* Phone (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Teléfono / WhatsApp (Opcional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+58 414 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                  />
                </div>
              </div>
            )}

            {/* Password (Login & Register) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77]">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (Register only) */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#B69C76]" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Entrar a Mi Cuenta'}
                    {mode === 'register' && 'Completar Registro'}
                    {mode === 'forgot' && 'Enviar Correo de Recuperación'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B69C76]" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch for Forgot mode */}
          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs text-[#7A8E77] hover:text-[#3C4A3C] font-bold"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* Trust badge */}
          <div className="mt-6 pt-4 border-t border-[#E6DFD4]/70 text-center">
            <span className="text-[10px] text-[#7A8E77] font-medium flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#B69C76]" />
              <span>Autenticación segura y respaldada por Supabase</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

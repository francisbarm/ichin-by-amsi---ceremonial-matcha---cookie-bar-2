import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, Phone, Sparkles, ArrowRight, 
  CheckCircle2, AlertCircle, Loader2, ShieldCheck, Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  initialPortal?: 'cliente' | 'admin';
  onNavigateToAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialPortal = 'cliente',
  onNavigateToAdmin,
}) => {
  const { signIn, signUp, resetPassword } = useAuth();
  
  // Selector principal: Portal Clientes vs Exclusivo Administradora
  const [portal, setPortal] = useState<'cliente' | 'admin'>(initialPortal);

  // Modo del formulario (login / register / forgot)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Modo de acceso de administradora: PIN rápido vs Correo Supabase
  const [adminMethod, setAdminMethod] = useState<'pin' | 'credentials'>('pin');
  const [adminPin, setAdminPin] = useState('');
  const [showPinHelper, setShowPinHelper] = useState(false);

  // Campos del formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de carga y retroalimentación
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
    setAdminPin('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchPortal = (newPortal: 'cliente' | 'admin') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPortal(newPortal);
    if (newPortal === 'admin') {
      setEmail('amsi.group@gmail.com');
      setFullName('Administradora AMSI');
    } else {
      if (email === 'amsi.group@gmail.com') {
        setEmail('');
        setFullName('');
      }
    }
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
    if (lower.includes('rate limit') || lower.includes('seconds')) {
      return 'Supabase tiene un límite de tiempo por seguridad. Por favor espera un momento o utiliza el acceso con PIN Maestro.';
    }
    return msg;
  };

  // Desbloqueo directo con PIN Maestro para la administradora
  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const clean = adminPin.trim().toUpperCase();

    if (clean === 'AMSI2026' || clean === '2026' || clean === 'ADMIN') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ichin_admin_pin_unlocked', 'true');
      }
      setSuccessMessage('¡PIN Maestro verificado! Entrando al Panel de Administradora...');
      setTimeout(() => {
        resetForm();
        onClose();
        if (onNavigateToAdmin) {
          onNavigateToAdmin();
        }
      }, 700);
    } else {
      setErrorMessage('PIN Maestro incorrecto. El PIN configurado para AMSI es AMSI2026.');
    }
  };

  // Autenticación con Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = (portal === 'admin' ? email || 'amsi.group@gmail.com' : email).trim();

    // Validación básica de correo
    if (!targetEmail || !targetEmail.includes('@')) {
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
        const { error } = await signIn(targetEmail, password);
        if (error) {
          setErrorMessage(translateAuthError(error.message));
          if (portal === 'admin') {
            setShowPinHelper(true);
          }
        } else {
          setSuccessMessage(
            portal === 'admin'
              ? '¡Bienvenida Administradora AMSI!'
              : '¡Bienvenido(a) a ICHIN By AMSI!'
          );
          setTimeout(() => {
            resetForm();
            onClose();
            if (portal === 'admin' && onNavigateToAdmin) {
              onNavigateToAdmin();
            }
          }, 800);
        }
      } else if (mode === 'register') {
        const assignedRole = portal === 'admin' ? 'admin' : 'cliente';
        const { error, needsEmailConfirmation } = await signUp({
          email: targetEmail,
          password,
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : undefined,
          role: assignedRole,
        });

        if (error) {
          setErrorMessage(translateAuthError(error.message));
          if (portal === 'admin') {
            setShowPinHelper(true);
          }
        } else if (needsEmailConfirmation) {
          setSuccessMessage(
            '¡Registro procesado! Revisa tu correo para confirmar tu cuenta y comenzar.'
          );
          if (portal === 'admin') {
            setShowPinHelper(true);
          }
        } else {
          setSuccessMessage('¡Cuenta creada e inicio de sesión exitoso!');
          setTimeout(() => {
            resetForm();
            onClose();
            if (portal === 'admin' && onNavigateToAdmin) {
              onNavigateToAdmin();
            }
          }, 900);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(targetEmail);
        if (error) {
          setErrorMessage(translateAuthError(error.message));
        } else {
          setSuccessMessage(
            'Hemos enviado el enlace de recuperación a tu correo electrónico.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#FAF8F4] rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-scaleUp my-auto"
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
          className="absolute top-4 right-4 p-2 rounded-full text-[#3C4A3C] hover:bg-[#E6DFD4]/50 transition-colors z-10"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="p-5 sm:p-7">
          
          {/* Top Selector: Clientes vs Administradora */}
          <div className="flex bg-[#EAE5D9] p-1 rounded-2xl mb-5 border border-[#D9D0C3]">
            <button
              type="button"
              onClick={() => handleSwitchPortal('cliente')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                portal === 'cliente'
                  ? 'bg-[#455546] text-white shadow-xs'
                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Soy Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPortal('admin')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                portal === 'admin'
                  ? 'bg-[#B69C76] text-[#2C2216] shadow-xs font-extrabold'
                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#455546]" />
              <span>Solo Administradora</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* SECCIÓN 1: PORTAL CLIENTES (REGISTRO & INICIO DE SESIÓN) */}
          {/* ========================================================= */}
          {portal === 'cliente' && (
            <>
              {/* Brand Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5D9] text-[#455546] text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
                  <span>Portal Clientes & Anfitriones</span>
                </div>
                <h2 className="text-2xl font-bold font-editorial text-[#3C4A3C]">
                  {mode === 'login' && 'Iniciar Sesión de Cliente'}
                  {mode === 'register' && 'Crear Cuenta de Cliente'}
                  {mode === 'forgot' && 'Recuperar Contraseña'}
                </h2>
                <p className="text-xs text-[#6A7869] mt-1 max-w-xs mx-auto">
                  {mode === 'login' && 'Accede para consultar el estatus de tus presupuestos y agendar tu evento.'}
                  {mode === 'register' && 'Regístrate para guardar tus cotizaciones de bodas y recibir seguimiento VIP.'}
                  {mode === 'forgot' && 'Ingresa tu correo para recibir las instrucciones de recuperación.'}
                </p>
              </div>

              {/* Mode Switcher Tabs for Clients */}
              {mode !== 'forgot' && (
                <div className="flex bg-[#EAE5D9]/70 p-1 rounded-full mb-5 border border-[#E6DFD4]">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                      mode === 'register'
                        ? 'bg-[#455546] text-white shadow-xs'
                        : 'text-[#525B4F] hover:text-[#3C4A3C]'
                    }`}
                  >
                    Registrarme
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* SECCIÓN 2: PORTAL ADMINISTRADORA (SOLO AMSI)               */}
          {/* ========================================================= */}
          {portal === 'admin' && (
            <div className="mb-5">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B69C76]/25 text-[#455546] text-[10px] font-black uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B69C76]" />
                  <span>Exclusivo Dueña • AMSI Group</span>
                </div>
                <h2 className="text-2xl font-bold font-editorial text-[#3C4A3C]">
                  Panel de Administradora
                </h2>
                <p className="text-xs text-[#6A7869] mt-1 max-w-xs mx-auto">
                  Acceso restringido para control financiero de ventas, gastos e inventario de insumos en Caracas.
                </p>
              </div>

              {/* Selector de Método Admin: PIN Maestro vs Correo Supabase */}
              <div className="flex bg-[#EAE5D9] p-1 rounded-full mb-4 border border-[#D9D0C3]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setAdminMethod('pin');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                    adminMethod === 'pin'
                      ? 'bg-[#455546] text-white shadow-xs'
                      : 'text-[#525B4F] hover:text-[#3C4A3C]'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-[#B69C76]" />
                  <span>PIN Maestro (Inmediato)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setAdminMethod('credentials');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                    adminMethod === 'credentials'
                      ? 'bg-[#455546] text-white shadow-xs'
                      : 'text-[#525B4F] hover:text-[#3C4A3C]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Correo AMSI</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback: Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{errorMessage}</span>
                {showPinHelper && (
                  <button
                    type="button"
                    onClick={() => {
                      setPortal('admin');
                      setAdminMethod('pin');
                      setErrorMessage(null);
                    }}
                    className="block font-bold text-[#455546] underline hover:text-[#2A352B] mt-1"
                  >
                    👉 Entrar de inmediato con tu PIN Maestro
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Feedback: Success Alert */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASO A: Administradora ingresando con PIN Maestro          */}
          {/* ========================================================= */}
          {portal === 'admin' && adminMethod === 'pin' ? (
            <form onSubmit={handlePinUnlock} className="space-y-4">
              <div className="p-4 bg-[#F2EFE9] border border-[#E6DFD4] rounded-2xl text-xs text-[#525B4F] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#3C4A3C]">
                  <Key className="w-4 h-4 text-[#B69C76]" />
                  <span>Desbloqueo Inmediato sin esperas</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#6A7869]">
                  Acceso directo y prioritario para la administradora de ICHIN By AMSI.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Código PIN Maestro
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-white border border-[#E6DFD4] rounded-xl text-sm tracking-widest font-bold text-center text-[#3C4A3C] placeholder:text-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-[#B69C76]" />
                <span>Desbloquear Finanzas & Inventario</span>
              </button>

              <div className="text-center pt-1">
                <p className="text-[10px] text-[#7A8E77] font-medium">
                  🔒 Clave secreta confidencial de la titular AMSI.
                </p>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* CASO B: Formulario con Correo y Contraseña (Cliente/Admin)*/
            /* ========================================================= */
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Selector de modo para Administradora si usa credenciales */}
              {portal === 'admin' && (
                <div className="flex bg-[#EAE5D9]/70 p-1 rounded-full mb-3 border border-[#E6DFD4]">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                      mode === 'register'
                        ? 'bg-[#455546] text-white shadow-xs'
                        : 'text-[#525B4F] hover:text-[#3C4A3C]'
                    }`}
                  >
                    Registrar Administradora
                  </button>
                </div>
              )}

              {/* Nombre Completo (Solo en Registro) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    {portal === 'admin' ? 'Nombre de la Administradora' : 'Nombre Completo'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={portal === 'admin' ? 'Administradora AMSI' : 'Ej. Valentina Mendoza'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                    />
                  </div>
                </div>
              )}

              {/* Correo Electrónico */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  {portal === 'admin' ? 'Correo Exclusivo Administradora' : 'Correo Electrónico'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7A8E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={portal === 'admin' ? 'amsi.group@gmail.com' : 'tu-correo@ejemplo.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77] focus:ring-1 focus:ring-[#7A8E77]"
                  />
                </div>
              </div>

              {/* Teléfono (Solo en Registro de Cliente) */}
              {portal === 'cliente' && mode === 'register' && (
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

              {/* Contraseña */}
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

              {/* Confirmar Contraseña (Solo en Registro) */}
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
                    <span>Conectando con el servidor...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && (portal === 'admin' ? 'Entrar como Administradora' : 'Entrar a Mi Cuenta')}
                      {mode === 'register' && (portal === 'admin' ? 'Crear Cuenta Administradora' : 'Completar Registro')}
                      {mode === 'forgot' && 'Enviar Enlace de Recuperación'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B69C76]" />
                  </>
                )}
              </button>
            </form>
          )}

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
            <span className="text-[10px] text-[#7A8E77] font-medium flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[#B69C76]" />
              <span>Autenticación y almacenamiento cifrado en Supabase</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

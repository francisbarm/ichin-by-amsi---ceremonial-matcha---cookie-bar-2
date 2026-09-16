import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Play, Pause, CheckCircle2, Award, 
  Clock, ArrowRight, ShieldCheck, Flame, Droplets,
  Video, Eye, RefreshCw, Upload, Link as LinkIcon, 
  Volume2, VolumeX, Maximize2
} from 'lucide-react';

interface MatchaRitualVideoSectionProps {
  onGoToQuoter?: () => void;
}

export const MatchaRitualVideoSection: React.FC<MatchaRitualVideoSectionProps> = ({
  onGoToQuoter,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fuentes de video 100% auténticas de MATCHA ceremonial en public/branding
  const defaultVideoSrc = '/branding/matcha-cinematic-ritual.mp4';
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ichin_custom_matcha_video');
      // Limpiar cualquier residuo previo que no sea el video ceremonial actual o un blob local
      if (!saved || saved.includes('barista') || saved.includes('coffee') || saved.includes('rustic') || saved.includes('whisking') || saved.includes('tea-ceremony') || saved.includes('latte')) {
        localStorage.removeItem('ichin_custom_matcha_video');
        return defaultVideoSrc;
      }
      return saved;
    }
    return defaultVideoSrc;
  });

  const [activeTab, setActiveTab] = useState<'matcha-ritual' | 'kyoto-plantation' | 'custom' | 'simulator'>('matcha-ritual');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  // Estados del Simulador de Batido en "W" (15 segundos)
  const [simSeconds, setSimSeconds] = useState(15);
  const [simActive, setSimActive] = useState(false);
  const [simFinished, setSimFinished] = useState(false);

  // Paso seleccionado en la guía
  const [activeStep, setActiveStep] = useState<number>(3);

  // Sincronizar estado de reproducción
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Cambiar entre presets auténticos de MATCHA
  const handleSelectPreset = (presetKey: 'matcha-ritual' | 'kyoto-plantation') => {
    const src = presetKey === 'matcha-ritual'
      ? '/branding/matcha-cinematic-ritual.mp4'
      : '/branding/kyoto-tea-plantation.mp4';
    setVideoSrc(src);
    setActiveTab(presetKey);
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ichin_custom_matcha_video');
      localStorage.removeItem('ichin_custom_video_name');
    }
  };

  // Manejador de subida de video propio desde el dispositivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear URL local para reproducción inmediata
    const localUrl = URL.createObjectURL(file);
    setVideoSrc(localUrl);
    setActiveTab('custom');
    setUploadSuccessNotice(`¡Video cargado con éxito: "${file.name}"! Ya puedes reproducirlo.`);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ichin_custom_video_name', file.name);
      } catch (err) {}
    }

    setTimeout(() => {
      setUploadSuccessNotice(null);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 1500);
  };

  // Guardar URL remota (ej. Dropbox, Cloudinary, servidor propio)
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const url = customUrlInput.trim();
    setVideoSrc(url);
    setActiveTab('custom');
    if (typeof window !== 'undefined') {
      localStorage.setItem('ichin_custom_matcha_video', url);
    }
    setUploadSuccessNotice('¡Enlace de video personalizado aplicado!');
    setTimeout(() => {
      setUploadSuccessNotice(null);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 1200);
  };

  // Lógica del cronómetro del simulador
  useEffect(() => {
    let interval: any = null;
    if (simActive && simSeconds > 0) {
      interval = setInterval(() => {
        setSimSeconds((prev) => prev - 1);
      }, 1000);
    } else if (simSeconds === 0 && simActive) {
      setSimActive(false);
      setSimFinished(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [simActive, simSeconds]);

  const startSimulator = () => {
    setSimSeconds(15);
    setSimFinished(false);
    setSimActive(true);
  };

  const steps = [
    {
      num: '01',
      title: 'El Tamizado Sagrado',
      subtitle: '2g con Chashaku de bambú',
      detail: 'El matcha ceremonial de primera cosecha genera estática natural que forma microgrumos. Pasarlo por el tamiz de malla fina antes del agua garantiza que cada partícula se hidrate de manera uniforme.',
      tip: 'Regla: 2 cucharadas curvas de bambú (aprox. 2g exactos de matcha ceremonial puro).',
      icon: '🍃',
    },
    {
      num: '02',
      title: 'Temperatura Exacta (75°C - 80°C)',
      subtitle: '60ml de agua filtrada',
      detail: 'El error más común es usar agua hirviendo (100°C). El exceso de calor quema los aminoácidos L-teanina, destruye los antioxidantes y amarga la infusión. A 80°C resalta el dulzor natural y el umami.',
      tip: 'Regla: Deja reposar el agua hervida 2 minutos o añade 1 parte de agua fría por 3 de caliente.',
      icon: '💧',
    },
    {
      num: '03',
      title: 'El Batido Firme en "W"',
      subtitle: '15 a 20 segundos intensos',
      detail: 'Sostén el Chasen de 100 filamentos con firmeza entre pulgar e índice. Mantén el codo y antebrazo estables y mueve únicamente la muñeca trazando una "W" o "M" veloz sin tocar el fondo de cerámica.',
      tip: 'Regla: Las cerdas flotan en la superficie media-alta para inyectar microburbujas densas.',
      icon: '⚡',
    },
    {
      num: '04',
      title: 'La Microespuma de Jade',
      subtitle: 'El cierre ceremonial',
      detail: 'Cuando la superficie esté colmada de una densa capa verde esmeralda, desacelera dibujando una "O" suave en el centro para disolver las burbujas grandes y retirar el batidor con reverencia.',
      tip: 'Resultado: Crema de jade espesa, uniforme y sedosa, la emblemática espuma ceremonial.',
      icon: '✨',
    },
  ];

  return (
    <section 
      id="matcha-ritual-video"
      className="my-12 sm:my-16 rounded-3xl bg-[#364437] text-[#FAF8F4] p-5 sm:p-10 border border-[#4D5D4E] shadow-2xl overflow-hidden relative"
    >
      {/* Luces de ambiente orgánicas */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8FA28C]/20 rounded-full blur-3xl pointer-events-none -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C8AF8A]/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 space-y-8">
        
        {/* Encabezado de la Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#4D5D4E]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4BE9B] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
              <span>Video Nativo Propio • Sin Errores de YouTube</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-editorial tracking-tight">
              El Arte del Matcha: Cómo se Debe Preparar de Forma Firme
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF8F4]/85 mt-2 leading-relaxed">
              En <strong className="text-[#D4BE9B]">ICHIN by/ Amsi</strong> no revolvemos: batimos con firmeza milimétrica y devoción. Reproduce nuestro video nativo oficial o sube tu propia grabación directa para mostrar a tus clientes el ritual auténtico del Chasen.
            </p>
          </div>

          {onGoToQuoter && (
            <button
              onClick={onGoToQuoter}
              className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#D4BE9B] hover:bg-[#C5AD88] text-[#2C2216] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 shrink-0"
            >
              <span>Llevar Barra con Barista en Vivo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notificación de carga */}
        {uploadSuccessNotice && (
          <div className="p-3.5 bg-emerald-900/80 border border-emerald-400 text-emerald-100 rounded-2xl text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#D4BE9B] shrink-0" />
            <span>{uploadSuccessNotice}</span>
          </div>
        )}

        {/* Pestañas de Control de Video: Ritual Matcha Uji vs Plantaciones Kioto vs Subir Video Propio vs Simulador */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap p-1 bg-[#2C372D] rounded-2xl border border-[#4D5D4E] gap-1">
            <button
              onClick={() => handleSelectPreset('matcha-ritual')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'matcha-ritual'
                  ? 'bg-[#FAF8F4] text-[#364437] shadow-sm'
                  : 'text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>Ritual Matcha Uji HD</span>
            </button>

            <button
              onClick={() => handleSelectPreset('kyoto-plantation')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'kyoto-plantation'
                  ? 'bg-[#FAF8F4] text-[#364437] shadow-sm'
                  : 'text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>Plantaciones Kioto HD</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-[#FAF8F4] text-[#364437] shadow-sm'
                  : 'text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>Subir Mi Propio Video</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-[#FAF8F4] text-[#364437] shadow-sm'
                  : 'text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>Simulador (15s)</span>
            </button>
          </div>

          {activeTab === 'custom' && (
            <label className="cursor-pointer px-4 py-2 rounded-full bg-[#B69C76] hover:bg-[#A38965] text-[#2C2216] text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>Seleccionar Video (MP4 / MOV de mi celular)</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/mov"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Cuadro para Enlace Externo si está en pestaña personalizada */}
        {activeTab === 'custom' && (
          <form onSubmit={handleApplyCustomUrl} className="p-4 bg-[#2C372D] rounded-2xl border border-[#4D5D4E] flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <LinkIcon className="w-4 h-4 text-[#B69C76] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="O pega el link directo de tu video (ej. https://tudominio.com/video.mp4)"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#364437] border border-[#4D5D4E] rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#B69C76]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF8F4] text-[#364437] hover:bg-white text-xs font-bold uppercase tracking-wider shrink-0 transition-all"
            >
              Aplicar Enlace
            </button>
          </form>
        )}

        {/* Grid Principal: Reproductor Nativo & Protocolo Técnico */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Reproductor HTML5 Profesional (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {activeTab === 'simulator' ? (
              /* MÓDULO INTERACTIVO: SIMULADOR DE RITMO DE BATIDO EN "W" */
              <div className="relative rounded-3xl overflow-hidden bg-[#242D25] border-2 border-[#D4BE9B] aspect-video p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B69C76]/20 text-[#D4BE9B] text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-[#B69C76]" />
                  <span>Entrenador de Cadencia de Muñeca (120 BPM)</span>
                </div>

                <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                  simActive 
                    ? 'border-[#B69C76] bg-[#455546] scale-110 shadow-[0_0_30px_rgba(182,156,118,0.5)] animate-pulse'
                    : simFinished
                    ? 'border-emerald-400 bg-emerald-950 scale-100'
                    : 'border-white/20 bg-white/5'
                }`}>
                  <span className="font-editorial text-4xl font-extrabold text-white">
                    {simSeconds}s
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#D4BE9B] tracking-widest">
                    {simActive ? '¡Bate en W!' : simFinished ? '¡Espuma Lista!' : 'Tiempo'}
                  </span>
                </div>

                <div className="max-w-sm space-y-1">
                  <h4 className="text-sm font-bold text-white font-editorial">
                    {simActive
                      ? '⚡ Mueve la muñeca rápido de adelante hacia atrás trazando una "W"'
                      : simFinished
                      ? '✨ ¡Perfecto! Desacelera en círculo suave para romper burbujas'
                      : 'Presiona el botón para sincronizar el tiempo sagrado de batido'}
                  </h4>
                  <p className="text-xs text-[#FAF8F4]/70">
                    {simActive ? 'No toques el fondo del cuenco. Mantén los filamentos en la superficie.' : '15 segundos exactos a 80°C generan la microespuma de jade.'}
                  </p>
                </div>

                <button
                  onClick={startSimulator}
                  className="px-6 py-3 rounded-full bg-[#D4BE9B] hover:bg-[#C5AD88] text-[#2C2216] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${simActive ? 'animate-spin' : ''}`} />
                  <span>{simActive ? 'Reiniciar Cronómetro' : 'Comenzar Práctica (15s)'}</span>
                </button>
              </div>
            ) : (
              /* REPRODUCTOR HTML5 NATIVO (100% FUNCIONAL Y OFFLINE) */
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border-2 border-[#D4BE9B]/50 shadow-2xl group">
                <video
                  ref={videoRef}
                  key={videoSrc}
                  src={videoSrc}
                  poster="/branding/matcha-station-aesthetic.jpg"
                  playsInline
                  loop
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Botón Central de Play si está pausado */}
                {!isPlaying && (
                  <div 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center cursor-pointer group-hover:bg-black/30 transition-all"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF8F4]/90 text-[#364437] flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-110 active:scale-95 pl-1">
                      <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
                    </div>
                  </div>
                )}

                {/* Barra de Controles Inferiores Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-3 text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                      title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                      title={isMuted ? 'Activar Sonido' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <span className="text-[11px] text-white/80 font-medium hidden sm:inline">
                      {activeTab === 'custom' 
                        ? 'Video Personalizado ICHIN by/ Amsi' 
                        : activeTab === 'kyoto-plantation' 
                        ? 'Plantaciones de Té Verde en Kioto, Japón • Origen del Matcha' 
                        : 'Ritual Ceremonial de Matcha • Grado Uji / Kioto'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFullscreen}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                      title="Pantalla Completa"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ficha Explicativa del Video Activo */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#2C372D] border border-[#4D5D4E] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4BE9B] text-[#2C2216]">
                  {activeTab === 'custom' 
                    ? 'Video Propio de la Administradora' 
                    : activeTab === 'kyoto-plantation' 
                    ? 'Origen: Terrazas de Kioto, Japón' 
                    : 'Ceremonia Tradicional del Matcha Puro'}
                </span>
                <span className="text-[11px] text-[#D4BE9B] font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>1080p Nativo HD</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-editorial">
                {activeTab === 'custom'
                  ? 'Video Propio de la Administradora'
                  : activeTab === 'kyoto-plantation'
                  ? 'El Origen Sagrado: Plantaciones de Té Verde en Kioto'
                  : 'El Sagrado Ritual del Chasen: Ceremonia Japonesa Auténtica'}
              </h3>

              <p className="text-xs text-[#FAF8F4]/80 leading-relaxed">
                {activeTab === 'custom'
                  ? 'Este es tu video propio cargado para ICHIN by/ Amsi. Puedes reemplazarlo en cualquier momento desde tu teléfono o computadora cuando filmes nuevo contenido de tu carrito en tus eventos de Caracas.'
                  : activeTab === 'kyoto-plantation'
                  ? 'Vuelo panorámico sobre las colinas y terrazas verdes de Kioto donde se cultivan las hojas de Tencha sombreadas a mano, origen del té matcha ceremonial de máxima pureza que llevamos a cada celebración.'
                  : 'Observa la maestría ancestral del Chado: el agua vertida con hishaku sobre el chawan, las medidas exactas de matcha ceremonial Uji con chashaku de bambú, y el batido enérgico con el chasen hasta coronar la auténtica microespuma de jade. 100% té matcha ceremonial japonés, sin atajos ni adulteraciones.'}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-xs text-[#D4BE9B]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#D4BE9B]" />
                <span className="font-semibold">
                  {activeTab === 'kyoto-plantation'
                    ? 'Regla de oro: Cosecha seleccionada a mano, secada y molida lentamente en molinos de granito de piedra.'
                    : activeTab === 'custom'
                    ? 'Regla de oro de ICHIN by/ Amsi: Transmite la elegancia y hospitalidad japonesa en tus eventos de Caracas.'
                    : 'Regla de oro de ICHIN by/ Amsi: Matcha ceremonial puro batido en vivo con chasen de bambú ante cada invitado.'}
                </span>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Protocolo en 4 Pasos Técnicos (5 Cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4BE9B] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4BE9B]" />
                <span>Protocolo de Batido Firme ICHIN by/ Amsi</span>
              </h3>
              <span className="text-[11px] text-[#FAF8F4]/70">Paso a paso</span>
            </div>

            {/* 4 Tarjetas Interactivas de Pasos */}
            <div className="space-y-2.5">
              {steps.map((s, idx) => {
                const isCurrent = activeStep === (idx + 1);
                return (
                  <div
                    key={s.num}
                    onClick={() => setActiveStep(idx + 1)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#FAF8F4] text-[#364437] border-white shadow-lg scale-[1.01]'
                        : 'bg-[#2C372D]/90 text-white/90 border-[#4D5D4E] hover:bg-[#344135]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full font-editorial font-bold text-sm flex items-center justify-center shrink-0 ${
                        isCurrent 
                          ? 'bg-[#364437] text-[#FAF8F4]' 
                          : 'bg-white/10 text-[#D4BE9B]'
                      }`}>
                        {s.num}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-[#364437]' : 'text-white'}`}>
                            {s.title}
                          </h4>
                          <span className="text-base">{s.icon}</span>
                        </div>

                        <div className={`text-[11px] font-semibold ${isCurrent ? 'text-[#7A8E77]' : 'text-[#D4BE9B]'}`}>
                          {s.subtitle}
                        </div>

                        <p className={`text-xs leading-relaxed pt-0.5 ${isCurrent ? 'text-[#525B4F]' : 'text-[#FAF8F4]/75'}`}>
                          {s.detail}
                        </p>

                        {isCurrent && (
                          <div className="mt-2 pt-2 border-t border-[#E6DFD4] text-[11px] font-medium text-[#455546] bg-[#FAF8F4] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#B69C76] shrink-0" />
                            <span>{s.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pie de Utensilios Sagrados */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-[#FAF8F4]/80 flex items-center justify-between">
              <span>🪥 Chasen (100 filamentos)</span>
              <span>•</span>
              <span>🥣 Chawan de gres</span>
              <span>•</span>
              <span>🥄 Chashaku (1g)</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

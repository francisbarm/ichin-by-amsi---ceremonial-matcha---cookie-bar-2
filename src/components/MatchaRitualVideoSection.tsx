import React, { useState } from 'react';
import { 
  Sparkles, Play, CheckCircle2, Award, 
  Clock, ArrowRight, ShieldCheck, Flame, Droplets,
  Video, Eye, RefreshCw
} from 'lucide-react';

interface MatchaRitualVideoSectionProps {
  onGoToQuoter?: () => void;
}

interface VideoTutorial {
  id: string;
  youtubeId: string;
  badge: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  duration: string;
  keyRule: string;
}

const TUTORIALS: VideoTutorial[] = [
  {
    id: 'firm-whisk',
    youtubeId: 'f0b8R1Qd-6s',
    badge: 'Técnica Insignia ICHIN',
    title: 'Cómo Batir el Matcha con Técnica Firme (Movimiento en W)',
    shortDesc: 'La muñeca suelta pero decidida para lograr la microespuma jade aterciopelada sin dañar el chasen.',
    fullDesc: 'En este video profesional aprenderás la postura corporal, el ángulo de 90° con el cuenco y el movimiento enérgico en "W" o "M". Descubre por qué nunca se debe batir en círculos y cómo suspender los filamentos de bambú justo debajo de la superficie para generar una emulsión cremosa y estable.',
    duration: 'Masterclass Técnica',
    keyRule: 'Muñeca libre, brazo firme, cero roce con el fondo del chawan.',
  },
  {
    id: 'usucha-ritual',
    youtubeId: 'kYJv1dK31uI',
    badge: 'Ritual Ceremonial Uji',
    title: 'Preparación Tradicional de Usucha (Té Fino)',
    shortDesc: 'La fórmula exacta de la ceremonia japonesa: 2g de matcha y 60ml de agua filtrada a 80°C.',
    fullDesc: 'Aprende el protocolo de purificación de utensilios, el tamizado previo para oxigenar el polvo verde y el choque térmico controlado a 80°C para extraer los aminoácidos L-teanina y el dulzor umami natural sin notas amargas.',
    duration: 'Ceremonia Japonesa',
    keyRule: 'Agua a 80°C exactos: el agua hirviendo quema el matcha.',
  },
  {
    id: 'usucha-koicha',
    youtubeId: '6P3B9-X1vXQ',
    badge: 'Alta Escuela',
    title: 'Doble Método: Usucha (Espuma Ligera) vs Koicha (Espeso)',
    shortDesc: 'Comparación técnica entre el batido de alta velocidad y el amasado denso imperial.',
    fullDesc: 'Comprende la versatilidad de la hoja Tencha de grado ceremonial: desde el Usucha espumoso para bebidas refrescantes y lattes, hasta el Koicha intenso y sedoso reservado para los momentos más sagrados de la ceremonia del té.',
    duration: 'Técnicas Comparativas',
    keyRule: 'Koicha requiere 4g y amasado lento; Usucha requiere 2g y batido firme.',
  },
];

export const MatchaRitualVideoSection: React.FC<MatchaRitualVideoSectionProps> = ({
  onGoToQuoter,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial>(TUTORIALS[0]);
  const [activeStep, setActiveStep] = useState<number>(3); // Default highlighting the firm whisk step

  const steps = [
    {
      num: '01',
      title: 'El Tamizado Sagrado',
      subtitle: '2g con Chashaku de bambú',
      detail: 'El matcha de primera cosecha es tan fino que genera estática natural. Pasar el polvo por un cedazo fino antes del agua rompe cualquier microgrumo y asegura una textura de terciopelo.',
      tip: 'Regla: 2 cucharadas curvas de bambú (aprox. 1 cucharadita de café rasa).',
      icon: '🍃',
    },
    {
      num: '02',
      title: 'Temperatura Exacta (75°C - 80°C)',
      subtitle: '60ml de agua filtrada',
      detail: 'El error más común es usar agua hirviendo (100°C). El exceso de calor quema los polifenoles, destruye los antioxidantes y amarga la infusión. A 80°C florece el umami suave y el dulzor natural de Kioto.',
      tip: 'Regla: Deja reposar el agua hervida durante 2 a 3 minutos antes de verter.',
      icon: '💧',
    },
    {
      num: '03',
      title: 'El Batido Firme en "W"',
      subtitle: '15 a 20 segundos enérgicos',
      detail: 'Sostén el batidor Chasen con firmeza entre pulgar e índice. Mantén el codo estable y mueve únicamente la muñeca en un vaivén rápido y recto trazando una "W" o "M" sin tocar el fondo cerámico.',
      tip: 'Regla: Los filamentos deben flotar en la parte media-alta para inyectar microburbujas.',
      icon: '⚡',
    },
    {
      num: '04',
      title: 'La Microespuma de Jade',
      subtitle: 'El cierre ceremonial',
      detail: 'Cuando la superficie esté cubierta por una espuma densa y verde brillante, reduce la velocidad y traza una "O" suave en el centro levantando el chasen despacio para romper burbujas grandes.',
      tip: 'Resultado: Crema uniforme y consistente como la de un espresso de especialidad.',
      icon: '✨',
    },
  ];

  return (
    <section 
      id="matcha-ritual-video"
      className="my-12 sm:my-16 rounded-3xl bg-[#364437] text-[#FAF8F4] p-5 sm:p-10 border border-[#4D5D4E] shadow-2xl overflow-hidden relative"
    >
      {/* Organic ambient light accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8FA28C]/20 rounded-full blur-3xl pointer-events-none -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C8AF8A]/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#4D5D4E]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4BE9B] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
              <span>Masterclass Ceremonial • Técnica Tradicional</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-editorial tracking-tight">
              El Arte del Matcha: Cómo se Debe Preparar de Forma Firme
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF8F4]/85 mt-2 leading-relaxed">
              En ICHIN By AMSI no revolvemos: batimos con firmeza, precisión milimétrica y devoción. Mira el video demostrativo profesional para dominar la técnica de muñeca con el batidor Chasen y lograr la microespuma jade perfecta.
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

        {/* Video Tutorial Selector Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {TUTORIALS.map((tut) => {
            const isSelected = selectedVideo.id === tut.id;
            return (
              <button
                key={tut.id}
                onClick={() => setSelectedVideo(tut)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#FAF8F4] text-[#364437] border-white shadow-md scale-[1.02]'
                    : 'bg-[#405041] text-[#FAF8F4]/80 border-[#4D5D4E] hover:bg-[#4A5D4B] hover:text-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#364437] text-white' : 'bg-white/10 text-[#D4BE9B]'}`}>
                  <Play className="w-3 h-3 fill-current" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{tut.badge}</div>
                  <div className="text-xs line-clamp-1">{tut.title.split(':')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Video & Protocol Grid (2 Columns on Large screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: High-Definition Video Player (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Embedded Responsive Player with Ceremonial Frame */}
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border-2 border-[#D4BE9B]/40 shadow-2xl group">
              <iframe
                className="w-full h-full object-cover"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1&autoplay=0&showinfo=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Current Video Info Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#405041]/90 border border-[#4D5D4E] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4BE9B] text-[#2C2216]">
                  {selectedVideo.badge}
                </span>
                <span className="text-[11px] text-[#D4BE9B] font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedVideo.duration}</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-editorial">
                {selectedVideo.title}
              </h3>

              <p className="text-xs text-[#FAF8F4]/80 leading-relaxed">
                {selectedVideo.fullDesc}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-xs text-[#D4BE9B]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#D4BE9B]" />
                <span className="font-semibold">Regla de oro: <span className="text-white/90 font-normal">{selectedVideo.keyRule}</span></span>
              </div>
            </div>

          </div>

          {/* Right Column: The 4 Steps of Firm Matcha Whisking (5 Cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4BE9B] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4BE9B]" />
                <span>Protocolo de Batido Firme ICHIN</span>
              </h3>
              <span className="text-[11px] text-[#FAF8F4]/70">Paso a paso</span>
            </div>

            {/* 4 Interactive Step Cards */}
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
                        : 'bg-[#405041]/60 text-white/90 border-[#4D5D4E] hover:bg-[#405041]'
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

            {/* Quick Utensils Footnote */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-[#FAF8F4]/80 flex items-center justify-between">
              <span>🪥 Chasen (Bambú blanco)</span>
              <span>•</span>
              <span>🥣 Chawan (Cerámica)</span>
              <span>•</span>
              <span>🥄 Chashaku (1g)</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

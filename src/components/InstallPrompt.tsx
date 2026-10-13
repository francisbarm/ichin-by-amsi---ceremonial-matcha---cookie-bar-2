import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'ichin_install_dismissed_at';
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Instagram|FBAN|FBAV/.test(ua);
  return ios && safari;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    let timer: number | undefined;
    if (isIosSafari()) {
      timer = window.setTimeout(() => {
        setShowIos(true);
        setVisible(true);
      }, 6000);
    }

    const onInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar ICHIN"
      className="fixed inset-x-3 z-[9999] mx-auto max-w-md rounded-2xl border border-[#E2DBD0] bg-[#FAF7F2]/95 p-4 shadow-[0_12px_40px_rgba(44,62,53,0.18)] backdrop-blur"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-editorial text-[15px] leading-tight text-[#2C3E35]">Lleva ICHIN en tu teléfono</p>
          {showIos ? (
            <p className="mt-1 text-[12.5px] leading-snug text-[#5B6A5B]">
              Toca <span className="font-semibold">Compartir</span>{' '}
              <svg aria-hidden="true" viewBox="0 0 24 24" className="inline h-3.5 w-3.5 -translate-y-px align-middle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>{' '}
              y luego <span className="font-semibold">“Agregar a pantalla de inicio”</span>.
            </p>
          ) : (
            <p className="mt-1 text-[12.5px] leading-snug text-[#5B6A5B]">
              Instálala gratis: menú, cotizador y tus reservas a un toque.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {!showIos && deferred && (
              <button
                type="button"
                onClick={install}
                className="rounded-full bg-[#2C3E35] px-4 py-1.5 text-[12.5px] font-semibold text-[#FAF7F2] transition hover:bg-[#3A5045]"
              >
                Instalar
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[#5B6A5B] transition hover:bg-[#EFE9DE]"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

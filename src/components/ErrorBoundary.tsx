import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-[#FAF8F4]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E6DFD4] shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#B69C76]/20 border border-[#B69C76]/40 flex items-center justify-center mx-auto text-[#455546]">
              <AlertTriangle className="w-7 h-7 text-[#B69C76]" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[#3C4A3C] font-editorial">
                {this.props.fallbackTitle || 'Ha ocurrido un detalle al cargar'}
              </h3>
              <p className="text-xs text-[#75786E] leading-relaxed">
                No te preocupes, tus datos están seguros. Puedes recargar o regresar al inicio para continuar con tu experiencia ceremonial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#D4BE9B]" />
                <span>Recargar</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF8F4] hover:bg-[#F3EFE7] text-[#3C4A3C] border border-[#E6DFD4] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#7A8E77]" />
                <span>Ir al Inicio</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left text-[11px] bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200 mt-2 overflow-auto max-h-32">
                <summary className="font-bold cursor-pointer">Detalle técnico del error</summary>
                <pre className="mt-1 whitespace-pre-wrap">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

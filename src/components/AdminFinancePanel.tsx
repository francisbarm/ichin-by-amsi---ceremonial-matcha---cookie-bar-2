import React, { useState, useEffect, useMemo } from 'react';
import { FinancialTransaction, TransactionType, FinancialCategory } from '../types';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Download, Filter, 
  Search, Calendar, Trash2, ShieldCheck, Lock, ArrowUpRight, 
  ArrowDownRight, PieChart, Wallet, CreditCard, Sparkles, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  obtenerTransaccionesFinancieras, 
  guardarTransaccionFinanciera, 
  eliminarTransaccionFinanciera 
} from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AdminFinancePanelProps {
  onBackToMenu: () => void;
  onOpenAuth: () => void;
}

export const AdminFinancePanel: React.FC<AdminFinancePanelProps> = ({
  onBackToMenu,
  onOpenAuth,
}) => {
  const { user, profile, isAdmin } = useAuth();

  // PIN de seguridad para acceso rápido de la administradora sin forzar login
  const [pinInput, setPinInput] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Estados de finanzas
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'gasto'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para agregar transacción
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FinancialCategory>('insumos_matcha');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo_usd' | 'pago_movil' | 'zelle' | 'transferencia'>('efectivo_usd');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [relatedBookingCode, setRelatedBookingCode] = useState('');
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Cargar transacciones
  const loadTransactions = async () => {
    setLoading(true);
    const res = await obtenerTransaccionesFinancieras();
    setTransactions(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Verificar si tiene acceso concedido (por sesión de admin o por PIN de barra)
  const hasAccess = isAdmin || isPinUnlocked;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'AMSI2026' || pinInput === '2026' || pinInput === 'admin') {
      setIsPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Cálculos Financieros
  const stats = useMemo(() => {
    const totalVentas = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalGastos = transactions
      .filter((t) => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0);

    const gananciaNeta = totalVentas - totalGastos;
    const margen = totalVentas > 0 ? (gananciaNeta / totalVentas) * 100 : 0;

    // Métodos de pago
    const porZelle = transactions
      .filter((t) => t.type === 'ingreso' && t.paymentMethod === 'zelle')
      .reduce((sum, t) => sum + t.amount, 0);

    const porEfectivo = transactions
      .filter((t) => t.type === 'ingreso' && t.paymentMethod === 'efectivo_usd')
      .reduce((sum, t) => sum + t.amount, 0);

    const porPagoMovil = transactions
      .filter((t) => t.type === 'ingreso' && t.paymentMethod === 'pago_movil')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalVentas,
      totalGastos,
      gananciaNeta,
      margen,
      porZelle,
      porEfectivo,
      porPagoMovil,
      ventasCount: transactions.filter((t) => t.type === 'ingreso').length,
      gastosCount: transactions.filter((t) => t.type === 'gasto').length,
    };
  }, [transactions]);

  // Transacciones filtradas
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.relatedBookingCode && t.relatedBookingCode.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Guardar nueva transacción
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) return;

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      type: txType,
      category,
      categoryLabel: getCategoryLabel(category),
      amount: parseFloat(amount),
      description: description.trim(),
      date,
      paymentMethod,
      relatedBookingCode: relatedBookingCode.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await guardarTransaccionFinanciera(newTx);
    setTransactions((prev) => [newTx, ...prev]);

    // Reset modal
    setAmount('');
    setDescription('');
    setRelatedBookingCode('');
    setNotes('');
    setIsModalOpen(false);

    setNotification(
      txType === 'ingreso'
        ? '¡Venta registrada exitosamente!'
        : '¡Gasto operativo guardado!'
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Eliminar transacción
  const handleDeleteTransaction = async (id: string) => {
    if (confirm('¿Estás segura de eliminar este movimiento financiero?')) {
      await eliminarTransaccionFinanciera(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setNotification('Movimiento eliminado.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Exportar a CSV para Excel / Google Sheets
  const handleExportCSV = () => {
    const headers = ['ID', 'Tipo', 'Categoria', 'Monto_USD', 'Concepto', 'Fecha', 'Metodo_Pago', 'Codigo_Evento'];
    const rows = transactions.map((t) => [
      t.id,
      t.type.toUpperCase(),
      `"${t.categoryLabel}"`,
      t.amount.toFixed(2),
      `"${t.description.replace(/"/g, '""')}"`,
      t.date,
      t.paymentMethod || 'N/A',
      t.relatedBookingCode || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ICHIN_Reporte_Finanzas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function getCategoryLabel(cat: FinancialCategory): string {
    switch (cat) {
      case 'insumos_matcha': return 'Matcha Ceremonial Uji';
      case 'leche_ingredientes': return 'Leches e Ingredientes';
      case 'vasos_empaques': return 'Vasos y Empaques PET';
      case 'personal_baristas': return 'Honorarios Baristas';
      case 'logistica_traslado': return 'Flete y Logística';
      case 'mobiliario_toldos': return 'Toldos y Mobiliario';
      case 'marketing_marca': return 'Marketing y Branding';
      case 'evento_boda': return 'Boda / Celebración';
      case 'evento_corporativo': return 'Evento Corporativo';
      case 'evento_privado': return 'Fiesta Privada VIP';
      case 'venta_mostrador': return 'Venta Directa Pop-up';
      case 'otros': return 'Otros Gastos';
      default: return cat;
    }
  }

  // Si no tiene acceso, mostrar pantalla de desbloqueo administrativo
  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E6DFD4] shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#455546] text-[#FAF8F4] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8 text-[#B69C76]" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B69C76]">
              Área Restringida
            </span>
            <h2 className="text-2xl font-bold text-[#3C4A3C] font-editorial mt-1">
              Panel de Administradora
            </h2>
            <p className="text-xs text-[#6A7869] mt-1.5">
              Control de gastos, ventas, ganancias netas y facturación de barra.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1 text-left">
                Código PIN de Administradora
              </label>
              <input
                type="password"
                placeholder="Ingresa PIN (ej. AMSI2026)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center tracking-widest text-base font-bold py-3 px-4 bg-[#FAF8F4] border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
              />
              {pinError && (
                <p className="text-[11px] text-red-500 font-bold mt-1.5">
                  PIN incorrecto. Intenta con AMSI2026
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider shadow-md"
            >
              Desbloquear Panel
            </button>
          </form>

          <div className="pt-3 border-t border-[#E6DFD4] flex flex-col gap-2">
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-[#7A8E77] hover:underline"
            >
              ¿Tienes cuenta de Administradora en Supabase? Inicia Sesión
            </button>
            <button
              onClick={onBackToMenu}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Volver a la Carta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-finance-container" className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B69C76]/20 text-[#455546] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B69C76]" />
            <span>ICHIN By AMSI • Control de Administradora</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C4A3C] font-editorial">
            Gastos, Ventas & Finanzas de Barra
          </h1>
          <p className="text-xs text-[#6A7869] mt-0.5">
            Registro en tiempo real de márgenes de beneficio, compras de insumos Uji y cobros de eventos.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTxType('gasto');
              setCategory('insumos_matcha');
              setIsModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Registrar Gasto</span>
          </button>

          <button
            onClick={() => {
              setTxType('ingreso');
              setCategory('evento_boda');
              setIsModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4 text-[#B69C76]" />
            <span>+ Registrar Venta</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 rounded-full bg-white border border-[#E6DFD4] text-[#3C4A3C] hover:bg-[#FAF8F4] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            title="Descargar en formato Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#7A8E77]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="p-5 rounded-3xl bg-white border border-[#E6DFD4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A8E77] font-bold uppercase tracking-wider mb-2">
            <span>Ventas Totales</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#3C4A3C] font-mono">
            ${stats.totalVentas.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#6A7869] mt-1 flex items-center gap-1">
            <span>{stats.ventasCount} eventos y órdenes cobradas</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-3xl bg-white border border-[#E6DFD4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-red-600 font-bold uppercase tracking-wider mb-2">
            <span>Gastos Operativos</span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
            ${stats.totalGastos.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#6A7869] mt-1">
            <span>Insumos, vasos, traslados y baristas</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-3xl bg-[#FAF8F4] border border-[#B69C76]/40 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#B69C76]/10 rounded-bl-full" />
          <div className="flex items-center justify-between text-xs text-[#455546] font-bold uppercase tracking-wider mb-2">
            <span>Utilidad Neta</span>
            <div className="w-8 h-8 rounded-full bg-[#B69C76]/25 text-[#455546] flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${stats.gananciaNeta >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            ${stats.gananciaNeta.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#7A8E77] font-semibold mt-1">
            <span>Balance neto de operaciones</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-5 rounded-3xl bg-white border border-[#E6DFD4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#3C4A3C] font-bold uppercase tracking-wider mb-2">
            <span>Margen de Ganancia</span>
            <div className="w-8 h-8 rounded-full bg-[#EAE5D9] text-[#3C4A3C] flex items-center justify-center">
              <PieChart className="w-4 h-4 text-[#7A8E77]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#455546] font-mono">
            {stats.margen.toFixed(1)}%
          </div>
          <div className="w-full bg-[#FAF8F4] rounded-full h-2 mt-2 overflow-hidden border border-[#E6DFD4]">
            <div 
              className="bg-[#7A8E77] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, stats.margen))}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Payment methods breakdown bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E6DFD4] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#3C4A3C]">
          <Wallet className="w-4 h-4 text-[#7A8E77]" />
          <span>Ingresos por Canal de Pago:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-gray-500">Zelle:</span>
            <strong className="text-[#3C4A3C] font-mono">${stats.porZelle.toFixed(2)}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-500">Efectivo USD:</span>
            <strong className="text-[#3C4A3C] font-mono">${stats.porEfectivo.toFixed(2)}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-500">Pago Móvil:</span>
            <strong className="text-[#3C4A3C] font-mono">${stats.porPagoMovil.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Main Table & Filters */}
      <div className="bg-white rounded-3xl border border-[#E6DFD4] shadow-sm overflow-hidden">
        
        {/* Table Filter Controls */}
        <div className="p-5 border-b border-[#E6DFD4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="flex bg-[#FAF8F4] p-1 rounded-full border border-[#E6DFD4] self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-[#455546] text-white shadow-2xs'
                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('ingreso')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === 'ingreso'
                  ? 'bg-[#455546] text-white shadow-2xs'
                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
              }`}
            >
              Ventas ({stats.ventasCount})
            </button>
            <button
              onClick={() => setFilterType('gasto')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === 'gasto'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
              }`}
            >
              Gastos ({stats.gastosCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por concepto o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[#FAF8F4] border border-[#E6DFD4] rounded-full focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[#E6DFD4] text-[#7A8E77] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Concepto / Categoría</th>
                <th className="py-3.5 px-4">Método de Pago</th>
                <th className="py-3.5 px-4">Evento / Ref</th>
                <th className="py-3.5 px-4 text-right">Monto (USD)</th>
                <th className="py-3.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFE7]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No se encontraron movimientos financieros con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                    {/* Type badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.type === 'ingreso' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowUpRight className="w-3 h-3" /> Venta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <ArrowDownRight className="w-3 h-3" /> Gasto
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Concept & Category */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-[#3C4A3C] truncate">{tx.description}</div>
                      <div className="text-[10px] text-[#7A8E77]">{tx.categoryLabel}</div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F4] border border-[#E6DFD4] font-semibold text-gray-600 uppercase">
                        {tx.paymentMethod ? tx.paymentMethod.replace('_', ' ') : 'N/A'}
                      </span>
                    </td>

                    {/* Related Booking */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.relatedBookingCode ? (
                        <span className="font-mono text-[11px] font-extrabold text-[#455546] bg-[#EAE5D9] px-2 py-0.5 rounded">
                          {tx.relatedBookingCode}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className={`py-3 px-4 text-right font-black font-mono text-sm whitespace-nowrap ${tx.type === 'ingreso' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {tx.type === 'ingreso' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Transacción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div 
            className="relative w-full max-w-lg bg-[#FAF8F4] rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-gradient-to-r from-[#455546] via-[#B69C76] to-[#455546]" />

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#3C4A3C] hover:bg-[#E6DFD4]/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold font-editorial text-[#3C4A3C]">
                {txType === 'ingreso' ? 'Registrar Venta / Cobro de Evento' : 'Registrar Gasto Operativo'}
              </h2>
              <p className="text-xs text-[#6A7869] mt-0.5">
                Ingresa los detalles para mantener actualizados los balances y márgenes.
              </p>

              {/* Type Switcher */}
              <div className="flex bg-[#EAE5D9] p-1 rounded-full my-4 border border-[#E6DFD4]">
                <button
                  type="button"
                  onClick={() => setTxType('gasto')}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                    txType === 'gasto'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Gasto Operativo
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('ingreso')}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                    txType === 'ingreso'
                      ? 'bg-[#455546] text-white shadow-xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Venta / Ingreso
                </button>
              </div>

              <form onSubmit={handleSaveTransaction} className="space-y-3.5">
                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                      Monto (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-[#7A8E77] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs font-mono font-bold text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                    />
                  </div>
                </div>

                {/* Concept description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Concepto o Descripción *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={txType === 'ingreso' ? 'Ej. Boda en Country Club - Paquete Luxury' : 'Ej. 500g Matcha Ceremonial Uji'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                {/* Category & Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FinancialCategory)}
                      className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                    >
                      {txType === 'gasto' ? (
                        <>
                          <option value="insumos_matcha">Matcha Ceremonial Uji</option>
                          <option value="leche_ingredientes">Leches e Ingredientes</option>
                          <option value="vasos_empaques">Vasos y Empaques PET</option>
                          <option value="personal_baristas">Honorarios Baristas</option>
                          <option value="logistica_traslado">Flete y Logística Carrito</option>
                          <option value="mobiliario_toldos">Toldos y Mobiliario</option>
                          <option value="marketing_marca">Marketing y Marca</option>
                          <option value="otros">Otros Gastos</option>
                        </>
                      ) : (
                        <>
                          <option value="evento_boda">Boda / Celebración</option>
                          <option value="evento_corporativo">Evento Corporativo</option>
                          <option value="evento_privado">Fiesta Privada VIP</option>
                          <option value="venta_mostrador">Venta Mostrador Pop-up</option>
                          <option value="otros">Otros Ingresos</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                    >
                      <option value="efectivo_usd">Efectivo USD</option>
                      <option value="zelle">Zelle</option>
                      <option value="pago_movil">Pago Móvil (Bs)</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                </div>

                {/* Related Booking Code */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Código de Evento Asociado (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. ICH-VAL78"
                    value={relatedBookingCode}
                    onChange={(e) => setRelatedBookingCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs font-mono text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  Guardar Movimiento
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

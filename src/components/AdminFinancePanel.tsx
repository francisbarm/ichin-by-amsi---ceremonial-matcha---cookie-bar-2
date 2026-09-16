import React, { useState, useEffect, useMemo } from 'react';
import { 
  FinancialTransaction, 
  TransactionType, 
  FinancialCategory,
  InventoryItem,
  InventoryCategory,
  InventoryUnit,
} from '../types';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Download, Filter, 
  Search, Calendar, Trash2, ShieldCheck, Lock, ArrowUpRight, 
  ArrowDownRight, PieChart, Wallet, CreditCard, Sparkles, X, CheckCircle2, 
  AlertCircle, Package, AlertTriangle, RefreshCw, Layers, Boxes,
  SlidersHorizontal, PlusCircle, MinusCircle, Tag, MapPin, Building2,
  ArrowRightLeft, FileSpreadsheet
} from 'lucide-react';
import { 
  obtenerTransaccionesFinancieras, 
  guardarTransaccionFinanciera, 
  eliminarTransaccionFinanciera,
  obtenerInventario,
  guardarItemInventario,
  actualizarStockItem,
  eliminarItemInventario,
  vaciarDatosAdministrativos
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
  const [isPinUnlocked, setIsPinUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ichin_admin_pin_unlocked') === 'true';
    }
    return false;
  });
  const [pinError, setPinError] = useState(false);

  // Selector de Pestaña Principal (Finanzas vs Inventario)
  const [activeTab, setActiveTab] = useState<'finanzas' | 'inventario'>('finanzas');

  // ==========================================
  // ESTADOS DE FINANZAS
  // ==========================================
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'gasto'>('all');
  const [financeSearchTerm, setFinanceSearchTerm] = useState('');

  // Modal para agregar transacción
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FinancialCategory>('insumos_matcha');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo_usd' | 'pago_movil' | 'zelle' | 'transferencia'>('efectivo_usd');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [relatedBookingCode, setRelatedBookingCode] = useState('');
  const [notes, setNotes] = useState('');

  // ==========================================
  // ESTADOS DE INVENTARIO
  // ==========================================
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  // Modal para nuevo insumo de inventario
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('matcha_te');
  const [newItemStock, setNewItemStock] = useState('10');
  const [newItemMinStock, setNewItemMinStock] = useState('5');
  const [newItemUnit, setNewItemUnit] = useState<InventoryUnit>('unidades');
  const [newItemCost, setNewItemCost] = useState('5.00');
  const [newItemSupplier, setNewItemSupplier] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('Carrito Móvil');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [registerNewItemExpense, setRegisterNewItemExpense] = useState(false);

  // Modal para ajustar stock
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState<InventoryItem | null>(null);
  const [adjustAction, setAdjustAction] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustQuantity, setAdjustQuantity] = useState('1');
  const [adjustReason, setAdjustReason] = useState<'compra' | 'evento' | 'merma' | 'conteo_fisico' | 'otro'>('compra');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [autoRegisterExpense, setAutoRegisterExpense] = useState(true);

  // Notificación flotante
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Cargar transacciones
  const loadTransactions = async () => {
    setLoadingTransactions(true);
    const res = await obtenerTransaccionesFinancieras();
    setTransactions(res.data);
    setLoadingTransactions(false);
  };

  // Cargar inventario
  const loadInventory = async () => {
    setLoadingInventory(true);
    const res = await obtenerInventario();
    setInventory(res.data);
    setLoadingInventory(false);
  };

  useEffect(() => {
    loadTransactions();
    loadInventory();
  }, []);

  // Verificar si tiene acceso concedido
  const hasAccess = isAdmin || isPinUnlocked;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim().toUpperCase();
    if (clean === 'AMSI2026' || clean === '2026' || clean === 'ADMIN') {
      setIsPinUnlocked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ichin_admin_pin_unlocked', 'true');
      }
      setPinError(false);
      showNotification('¡Acceso concedido al Panel de Administradora!');
    } else {
      setPinError(true);
    }
  };

  const handleLockAdmin = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ichin_admin_pin_unlocked');
    }
    setIsPinUnlocked(false);
    showNotification('Panel de Administradora bloqueado.');
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas vaciar todas las transacciones contables y el catálogo de inventario para dejarlos completamente limpios (sin nada)?')) {
      vaciarDatosAdministrativos();
      setTransactions([]);
      setInventory([]);
      showNotification('Panel financiero e inventario restablecidos a cero con éxito.');
    }
  };

  // ==========================================
  // CÁLCULOS FINANCIEROS (KPIs)
  // ==========================================
  const stats = useMemo(() => {
    const totalVentas = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalGastos = transactions
      .filter((t) => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0);

    const gananciaNeta = totalVentas - totalGastos;
    const margen = totalVentas > 0 ? (gananciaNeta / totalVentas) * 100 : 0;

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
      conteoTotal: transactions.length,
      conteoVentas: transactions.filter((t) => t.type === 'ingreso').length,
      conteoGastos: transactions.filter((t) => t.type === 'gasto').length,
    };
  }, [transactions]);

  // Transacciones filtradas
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchType = filterType === 'all' || tx.type === filterType;
      const matchSearch =
        tx.description.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
        tx.categoryLabel.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
        (tx.relatedBookingCode && tx.relatedBookingCode.toLowerCase().includes(financeSearchTerm.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [transactions, filterType, financeSearchTerm]);

  // ==========================================
  // CÁLCULOS DE INVENTARIO (KPIs)
  // ==========================================
  const inventoryStats = useMemo(() => {
    const totalItems = inventory.length;
    const totalValuation = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
    const criticalItems = inventory.filter(item => item.currentStock <= item.minStock);
    const reorderItems = inventory.filter(item => item.currentStock > item.minStock && item.currentStock <= (item.minStock * 1.5));
    const optimalItems = inventory.filter(item => item.currentStock > (item.minStock * 1.5));
    const healthRate = totalItems > 0 ? (optimalItems.length / totalItems) * 100 : 100;

    return {
      totalItems,
      totalValuation,
      criticalCount: criticalItems.length,
      reorderCount: reorderItems.length,
      alertsTotal: criticalItems.length + reorderItems.length,
      healthRate,
    };
  }, [inventory]);

  // Insumos filtrados
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = 
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(inventorySearch.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(inventorySearch.toLowerCase()));
      const matchAlert = !onlyAlerts || item.currentStock <= (item.minStock * 1.5);
      return matchCat && matchSearch && matchAlert;
    });
  }, [inventory, selectedCategory, inventorySearch, onlyAlerts]);

  // ==========================================
  // MANEJADORES DE ACCIÓN: FINANZAS
  // ==========================================
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert('Por favor introduce un monto válido mayor a 0');
      return;
    }

    if (!description.trim()) {
      alert('Por favor introduce un concepto o descripción');
      return;
    }

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      type: txType,
      category,
      categoryLabel: getCategoryLabel(category),
      amount: val,
      description: description.trim(),
      date,
      paymentMethod,
      relatedBookingCode: relatedBookingCode.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await guardarTransaccionFinanciera(newTx);
    setTransactions(prev => [newTx, ...prev]);
    setIsTxModalOpen(false);

    // Resetear formulario
    setAmount('');
    setDescription('');
    setRelatedBookingCode('');
    setNotes('');
    showNotification(`¡${txType === 'ingreso' ? 'Venta' : 'Gasto'} de $${val.toFixed(2)} registrado exitosamente!`);
  };

  const handleDeleteTransaction = async (id: string, desc: string) => {
    if (window.confirm(`¿Estás segura de eliminar el registro "${desc}"?`)) {
      await eliminarTransaccionFinanciera(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      showNotification('Registro eliminado del libro financiero.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID,Tipo,Categoría,Monto_USD,Concepto,Fecha,Metodo_Pago,Codigo_Evento,Notas\n'];
    const rows = transactions.map((t) =>
      `"${t.id}","${t.type}","${t.categoryLabel}","${t.amount.toFixed(2)}","${t.description.replace(/"/g, '""')}","${t.date}","${t.paymentMethod || ''}","${t.relatedBookingCode || ''}","${(t.notes || '').replace(/"/g, '""')}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ichin_finanzas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // MANEJADORES DE ACCIÓN: INVENTARIO
  // ==========================================
  const handleQuickStockDelta = async (item: InventoryItem, delta: number) => {
    const newStock = Math.max(0, item.currentStock + delta);
    const reason = delta > 0 ? 'compra' : 'evento';
    const res = await actualizarStockItem(item.id, newStock, reason, `Ajuste rápido ${delta > 0 ? '+' : ''}${delta}`);
    if (res.success && res.item) {
      setInventory(prev => prev.map(i => i.id === item.id ? res.item! : i));
      showNotification(`Stock de ${item.name} actualizado a ${newStock} ${item.unit}.`);
    }
  };

  const openAdjustModal = (item: InventoryItem) => {
    setAdjustTargetItem(item);
    setAdjustAction('add');
    setAdjustQuantity('1');
    setAdjustReason('compra');
    setAdjustNotes('');
    setAutoRegisterExpense(true);
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetItem) return;

    const qty = parseFloat(adjustQuantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Por favor introduce una cantidad válida');
      return;
    }

    let calculatedNewStock = adjustTargetItem.currentStock;
    if (adjustAction === 'add') {
      calculatedNewStock += qty;
    } else if (adjustAction === 'subtract') {
      calculatedNewStock = Math.max(0, calculatedNewStock - qty);
    } else {
      calculatedNewStock = Math.max(0, qty);
    }

    const res = await actualizarStockItem(
      adjustTargetItem.id,
      calculatedNewStock,
      adjustReason,
      adjustNotes.trim()
    );

    if (res.success && res.item) {
      setInventory(prev => prev.map(i => i.id === adjustTargetItem.id ? res.item! : i));

      // Si fue una entrada por compra y marcó registrar gasto en finanzas:
      if (adjustAction === 'add' && adjustReason === 'compra' && autoRegisterExpense) {
        const totalExpenseCost = qty * adjustTargetItem.costPerUnit;
        const txCategory = mapInventoryCatToFinanceCat(adjustTargetItem.category);
        const autoTx: FinancialTransaction = {
          id: `tx-inv-${Date.now()}`,
          type: 'gasto',
          category: txCategory,
          categoryLabel: getCategoryLabel(txCategory),
          amount: totalExpenseCost,
          description: `Reposición stock: +${qty} ${adjustTargetItem.unit} de ${adjustTargetItem.name}`,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'efectivo_usd',
          notes: `Generado automáticamente desde Inventario. Proveedor: ${adjustTargetItem.supplier || 'N/A'}`,
          createdAt: new Date().toISOString(),
        };
        await guardarTransaccionFinanciera(autoTx);
        setTransactions(prev => [autoTx, ...prev]);
        showNotification(`Stock actualizado y gasto de $${totalExpenseCost.toFixed(2)} registrado en Finanzas.`);
      } else {
        showNotification(`Stock de ${adjustTargetItem.name} actualizado a ${calculatedNewStock} ${adjustTargetItem.unit}.`);
      }
    }

    setIsAdjustModalOpen(false);
  };

  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      alert('Por favor indica el nombre del insumo');
      return;
    }

    const stockNum = parseFloat(newItemStock) || 0;
    const minStockNum = parseFloat(newItemMinStock) || 0;
    const costNum = parseFloat(newItemCost) || 0;

    const skuGen = newItemSku.trim() || `SKU-${Date.now().toString().slice(-6)}`;
    const categoryLabel = getInventoryCategoryLabel(newItemCategory);

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      sku: skuGen,
      name: newItemName.trim(),
      category: newItemCategory,
      categoryLabel,
      currentStock: stockNum,
      minStock: minStockNum,
      unit: newItemUnit,
      costPerUnit: costNum,
      supplier: newItemSupplier.trim() || undefined,
      location: newItemLocation.trim() || 'Carrito Móvil',
      lastRestockedDate: new Date().toISOString().split('T')[0],
      notes: newItemNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await guardarItemInventario(newItem);
    setInventory(prev => [newItem, ...prev]);

    // Si marcó registrar costo inicial como gasto
    if (registerNewItemExpense && stockNum > 0 && costNum > 0) {
      const initialCost = stockNum * costNum;
      const finCat = mapInventoryCatToFinanceCat(newItemCategory);
      const autoTx: FinancialTransaction = {
        id: `tx-init-${Date.now()}`,
        type: 'gasto',
        category: finCat,
        categoryLabel: getCategoryLabel(finCat),
        amount: initialCost,
        description: `Adquisición inicial: ${stockNum} ${newItemUnit} de ${newItem.name}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'efectivo_usd',
        notes: `Alta de nuevo insumo en inventario. Proveedor: ${newItemSupplier || 'N/A'}`,
        createdAt: new Date().toISOString(),
      };
      await guardarTransaccionFinanciera(autoTx);
      setTransactions(prev => [autoTx, ...prev]);
    }

    setIsNewItemModalOpen(false);
    setNewItemName('');
    setNewItemSku('');
    setNewItemSupplier('');
    setNewItemNotes('');
    setRegisterNewItemExpense(false);
    showNotification(`¡Insumo "${newItem.name}" agregado al catálogo de inventario!`);
  };

  const handleDeleteInventoryItem = async (item: InventoryItem) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${item.name}" del inventario?`)) {
      await eliminarItemInventario(item.id);
      setInventory(prev => prev.filter(i => i.id !== item.id));
      showNotification('Insumo eliminado del inventario.');
    }
  };

  const handleExportInventoryCSV = () => {
    const headers = ['SKU,Insumo,Departamento,Stock_Actual,Stock_Minimo,Unidad,Costo_Unitario_USD,Valor_Total_USD,Ubicacion,Proveedor,Ultima_Reposicion\n'];
    const rows = inventory.map((i) => {
      const totalVal = (i.currentStock * i.costPerUnit).toFixed(2);
      return `"${i.sku}","${i.name.replace(/"/g, '""')}","${i.categoryLabel}","${i.currentStock}","${i.minStock}","${i.unit}","${i.costPerUnit.toFixed(2)}","${totalVal}","${i.location || ''}","${(i.supplier || '').replace(/"/g, '""')}","${i.lastRestockedDate || ''}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ichin_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper labels
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
      case 'otros': return 'Otros Movimientos';
      default: return cat;
    }
  }

  function getInventoryCategoryLabel(cat: InventoryCategory): string {
    switch (cat) {
      case 'matcha_te': return 'Matcha & Té Ceremonial';
      case 'lacteos_bebidas': return 'Lácteos & Jarabes';
      case 'empaques_desechables': return 'Empaques & Vasos';
      case 'reposteria': return 'Repostería & Cookies';
      case 'merch_accesorios': return 'Merchandising & Barra';
      default: return cat;
    }
  }

  function mapInventoryCatToFinanceCat(cat: InventoryCategory): FinancialCategory {
    switch (cat) {
      case 'matcha_te': return 'insumos_matcha';
      case 'lacteos_bebidas': return 'leche_ingredientes';
      case 'empaques_desechables': return 'vasos_empaques';
      case 'reposteria': return 'leche_ingredientes';
      case 'merch_accesorios': return 'vasos_empaques';
      default: return 'otros';
    }
  }

  // ==========================================
  // PANTALLA DE DESBLOQUEO (PIN O LOGIN)
  // ==========================================
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
              Gestión de gastos, ventas, flujo de caja y control de inventario de barra.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1 text-left">
                Código PIN de Administradora
              </label>
              <input
                type="password"
                placeholder="Introduce tu PIN Maestro"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center tracking-widest text-base font-bold py-3 px-4 bg-[#FAF8F4] border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
              />
              {pinError && (
                <p className="text-[11px] text-red-500 font-bold mt-1.5">
                  PIN no autorizado. Acceso restringido a la administradora.
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B69C76]/20 text-[#455546] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B69C76]" />
            <span>ICHIN By AMSI • Panel de Administradora</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C4A3C] font-editorial">
            {activeTab === 'finanzas' ? 'Finanzas, Gastos & Ventas' : 'Manejo y Control de Inventario'}
          </h1>
          <p className="text-xs text-[#6A7869] mt-0.5">
            {activeTab === 'finanzas' 
              ? 'Balance contable en tiempo real de ingresos por eventos, cobros en barra y compras de insumos.'
              : 'Monitoreo de existencias de matcha ceremonial Uji, leches vegetales, vasos PET y repostería en Caracas.'}
          </p>
        </div>

        {/* Tab Navigation & Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 bg-[#EBE5DA] rounded-2xl border border-[#D9D0C3]">
            <button
              onClick={() => setActiveTab('finanzas')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'finanzas'
                  ? 'bg-[#455546] text-white shadow-sm'
                  : 'text-[#455546] hover:text-[#242E25]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Finanzas</span>
            </button>

            <button
              onClick={() => setActiveTab('inventario')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 relative ${
                activeTab === 'inventario'
                  ? 'bg-[#455546] text-white shadow-sm'
                  : 'text-[#455546] hover:text-[#242E25]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventario</span>
              {inventoryStats.criticalCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {inventoryStats.criticalCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Action Buttons for Current Tab */}
          {activeTab === 'finanzas' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTxType('gasto');
                  setCategory('insumos_matcha');
                  setIsTxModalOpen(true);
                }}
                className="py-2.5 px-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>+ Gasto</span>
              </button>

              <button
                onClick={() => {
                  setTxType('ingreso');
                  setCategory('evento_boda');
                  setIsTxModalOpen(true);
                }}
                className="py-2.5 px-3.5 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-[#B69C76]" />
                <span>+ Venta</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="py-2.5 px-3 rounded-full bg-white border border-[#E6DFD4] text-[#3C4A3C] hover:bg-[#FAF8F4] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                title="Descargar en formato Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#7A8E77]" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewItemModalOpen(true)}
                className="py-2.5 px-4 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#B69C76]" />
                <span>+ Nuevo Insumo</span>
              </button>

              <button
                onClick={handleExportInventoryCSV}
                className="py-2.5 px-3 rounded-full bg-white border border-[#E6DFD4] text-[#3C4A3C] hover:bg-[#FAF8F4] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                title="Descargar reporte de existencias en Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#7A8E77]" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            </div>
          )}

          {/* Panel Lock, Reset & Return controls */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#D9D0C3]">
            <button
              onClick={handleResetData}
              className="py-2.5 px-3 rounded-full bg-white border border-[#E6DFD4] text-gray-500 hover:text-amber-700 hover:border-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              title="Vaciar todos los registros para iniciar completamente en cero"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#B69C76]" />
              <span className="hidden xl:inline">Iniciar en Cero</span>
            </button>

            <button
              onClick={handleLockAdmin}
              className="py-2.5 px-3 rounded-full bg-white border border-[#E6DFD4] text-[#7A8E77] hover:text-red-600 hover:border-red-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              title="Bloquear acceso al panel administrativo"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Bloquear</span>
            </button>

            <button
              onClick={onBackToMenu}
              className="py-2.5 px-3 rounded-full bg-[#FAF8F4] border border-[#E6DFD4] text-[#455546] hover:bg-[#EAE5D9] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              title="Volver a la Carta Principal"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 1: VISTA DE FINANZAS */}
      {/* ========================================================================= */}
      {activeTab === 'finanzas' && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Ventas Totales</span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#3C4A3C] font-editorial">
                ${stats.totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#6A7869]">
                {stats.conteoVentas} reservas y eventos facturados
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Gastos Operativos</span>
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#3C4A3C] font-editorial">
                ${stats.totalGastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#6A7869]">
                {stats.conteoGastos} pagos (insumos Uji, personal, flete)
              </p>
            </div>

            {/* Net Profit */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Utilidad Neta</span>
                <div className="w-8 h-8 rounded-full bg-[#B69C76]/20 text-[#455546] flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#B69C76]" />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold font-editorial ${stats.gananciaNeta >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                ${stats.gananciaNeta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`font-bold ${stats.gananciaNeta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stats.margen.toFixed(1)}% margen
                </span>
                <span className="text-[#6A7869]">sobre ventas</span>
              </div>
            </div>

            {/* Profit Margin Progress */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Rentabilidad Barra</span>
                <PieChart className="w-4 h-4 text-[#B69C76]" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#3C4A3C]">
                  <span>Retorno Neto</span>
                  <span>{stats.margen.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#FAF8F4] h-2.5 rounded-full overflow-hidden border border-[#E6DFD4]">
                  <div 
                    className="bg-[#455546] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, stats.margen))}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#6A7869]">
                Ratio óptimo para catering ceremonial en Caracas
              </p>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-[#FAF8F4] p-5 rounded-3xl border border-[#E6DFD4] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A8E77] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>Desglose de Ingresos por Medio de Pago</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E6DFD4] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500">Zelle (USD)</span>
                  <p className="text-lg font-bold text-[#3C4A3C] font-editorial">
                    ${stats.porZelle.toFixed(2)}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold">
                  {stats.totalVentas > 0 ? ((stats.porZelle / stats.totalVentas) * 100).toFixed(0) : 0}%
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E6DFD4] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500">Efectivo USD</span>
                  <p className="text-lg font-bold text-[#3C4A3C] font-editorial">
                    ${stats.porEfectivo.toFixed(2)}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  {stats.totalVentas > 0 ? ((stats.porEfectivo / stats.totalVentas) * 100).toFixed(0) : 0}%
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E6DFD4] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500">Pago Móvil (Bs / BCV)</span>
                  <p className="text-lg font-bold text-[#3C4A3C] font-editorial">
                    ${stats.porPagoMovil.toFixed(2)}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                  {stats.totalVentas > 0 ? ((stats.porPagoMovil / stats.totalVentas) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#E6DFD4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter tabs */}
            <div className="flex p-1 bg-[#FAF8F4] rounded-2xl border border-[#E6DFD4] w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'all'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'text-[#6A7869] hover:text-[#3C4A3C]'
                }`}
              >
                Todos ({transactions.length})
              </button>
              <button
                onClick={() => setFilterType('ingreso')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'ingreso'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-[#6A7869] hover:text-emerald-700'
                }`}
              >
                Ventas ({stats.conteoVentas})
              </button>
              <button
                onClick={() => setFilterType('gasto')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'gasto'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-[#6A7869] hover:text-red-600'
                }`}
              >
                Gastos ({stats.conteoGastos})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por concepto o código..."
                value={financeSearchTerm}
                onChange={(e) => setFinanceSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF8F4] border border-[#E6DFD4] rounded-2xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
              />
              {financeSearchTerm && (
                <button
                  onClick={() => setFinanceSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-[#E6DFD4] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E6DFD4] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#3C4A3C] font-editorial">
                  Historial de Movimientos de Caja
                </h3>
                <p className="text-xs text-[#6A7869]">
                  {filteredTransactions.length} movimientos encontrados
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#B69C76]">
                Valores expresados en USD
              </span>
            </div>

            {loadingTransactions ? (
              <div className="p-12 text-center text-xs text-gray-400">
                Cargando registros contables...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 sm:p-14 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EAE5D9] text-[#455546] flex items-center justify-center shadow-inner">
                  <DollarSign className="w-7 h-7 text-[#B69C76]" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-base font-bold text-[#3C4A3C] font-editorial">
                    Panel Contable Listo y en Blanco
                  </h4>
                  <p className="text-xs text-[#6A7869] mt-1.5 leading-relaxed">
                    Aún no hay ingresos ni gastos registrados. Como administradora puedes comenzar a cargar tus ventas y compras de insumos para calcular la rentabilidad en tiempo real.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setTxType('ingreso');
                      setCategory('evento_boda');
                      setIsTxModalOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#B69C76]" />
                    <span>+ Registrar Primera Venta</span>
                  </button>
                  <button
                    onClick={() => {
                      setTxType('gasto');
                      setCategory('insumos_matcha');
                      setIsTxModalOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>+ Registrar Primer Gasto</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F4] border-b border-[#E6DFD4] text-[#7A8E77] uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Concepto / Descripción</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4 text-right">Monto (USD)</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD4]">
                    {filteredTransactions.map((tx) => {
                      const isVenta = tx.type === 'ingreso';
                      return (
                        <tr key={tx.id} className="hover:bg-[#FAF8F4]/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isVenta
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {isVenta ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              <span>{isVenta ? 'Venta' : 'Gasto'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-[#3C4A3C]">
                              {tx.categoryLabel}
                            </span>
                            {tx.relatedBookingCode && (
                              <span className="block text-[10px] font-mono text-[#B69C76]">
                                Código: {tx.relatedBookingCode}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#3C4A3C]">{tx.description}</p>
                            {tx.notes && (
                              <p className="text-[11px] text-gray-400 mt-0.5 italic">{tx.notes}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                            <span className="capitalize">
                              {tx.paymentMethod ? tx.paymentMethod.replace('_', ' ') : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <span
                              className={`text-sm font-bold font-editorial ${
                                isVenta ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {isVenta ? '+' : '-'}${tx.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteTransaction(tx.id, tx.description)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar movimiento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: VISTA DE CONTROL DE INVENTARIO */}
      {/* ========================================================================= */}
      {activeTab === 'inventario' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Inventory KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Valuation */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Valoración Total</span>
                <div className="w-8 h-8 rounded-full bg-[#B69C76]/20 text-[#455546] flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-[#B69C76]" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#3C4A3C] font-editorial">
                ${inventoryStats.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#6A7869]">
                Costo total de reposición de existencias en almacén
              </p>
            </div>

            {/* Total Items & SKUs */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Catálogo Activo</span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#3C4A3C] font-editorial">
                {inventoryStats.totalItems} Insumos
              </div>
              <p className="text-[11px] text-[#6A7869]">
                Distribuidos en 5 departamentos de barra
              </p>
            </div>

            {/* Alerts & Critical Stock */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Alertas de Stock</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  inventoryStats.criticalCount > 0 
                    ? 'bg-red-100 text-red-600' 
                    : inventoryStats.reorderCount > 0 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-bold font-editorial ${
                  inventoryStats.criticalCount > 0 ? 'text-red-600' : 'text-[#3C4A3C]'
                }`}>
                  {inventoryStats.criticalCount}
                </span>
                <span className="text-xs font-bold text-red-600">críticos</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs font-bold text-amber-600">
                  {inventoryStats.reorderCount} por reordenar
                </span>
              </div>
              <p className="text-[11px] text-[#6A7869]">
                Insumos que requieren pedido inmediato a proveedores
              </p>
            </div>

            {/* Stock Health */}
            <div className="bg-white p-5 rounded-3xl border border-[#E6DFD4] shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#7A8E77]">
                <span className="text-xs font-bold uppercase tracking-wider">Salud del Stock</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#3C4A3C]">
                  <span>Nivel Óptimo</span>
                  <span>{inventoryStats.healthRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#FAF8F4] h-2.5 rounded-full overflow-hidden border border-[#E6DFD4]">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${inventoryStats.healthRate}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#6A7869]">
                Cobertura asegurada para próximos eventos y bodas
              </p>
            </div>
          </div>

          {/* Filters, Categories and Search */}
          <div className="space-y-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4]'
                }`}
              >
                Todos ({inventory.length})
              </button>
              <button
                onClick={() => setSelectedCategory('matcha_te')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'matcha_te'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4]'
                }`}
              >
                Matcha & Té Ceremonial
              </button>
              <button
                onClick={() => setSelectedCategory('lacteos_bebidas')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'lacteos_bebidas'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4]'
                }`}
              >
                Lácteos & Jarabes
              </button>
              <button
                onClick={() => setSelectedCategory('empaques_desechables')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'empaques_desechables'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4]'
                }`}
              >
                Empaques & Vasos PET
              </button>
              <button
                onClick={() => setSelectedCategory('reposteria')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'reposteria'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4]'
                }`}
              >
                Repostería & Cookies
              </button>
              <button
                onClick={() => setSelectedCategory('merch_accesorios')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'merch_accesorios'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4]'
                }`}
              >
                Merch & Barra
              </button>
            </div>

            {/* Search and Alert Toggle Bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#E6DFD4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por insumo, SKU o proveedor..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF8F4] border border-[#E6DFD4] rounded-2xl text-xs text-[#3C4A3C] placeholder-gray-400 focus:outline-none focus:border-[#7A8E77]"
                />
                {inventorySearch && (
                  <button
                    onClick={() => setInventorySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#455546]">
                  <input
                    type="checkbox"
                    checked={onlyAlerts}
                    onChange={(e) => setOnlyAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-[#455546] focus:ring-[#7A8E77] border-[#E6DFD4]"
                  />
                  <span>Ver solo alertas de stock bajo</span>
                </label>

                <button
                  onClick={loadInventory}
                  className="p-2 text-[#7A8E77] hover:text-[#455546] hover:bg-[#FAF8F4] rounded-xl transition-all"
                  title="Recargar inventario"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl border border-[#E6DFD4] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E6DFD4] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#3C4A3C] font-editorial">
                  Existencias en Almacén & Carrito Móvil
                </h3>
                <p className="text-xs text-[#6A7869]">
                  {filteredInventory.length} artículos en lista
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#B69C76]">
                Valuación en USD
              </span>
            </div>

            {loadingInventory ? (
              <div className="p-12 text-center text-xs text-gray-400">
                Cargando inventario de insumos ceremoniales...
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-8 sm:p-14 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EAE5D9] text-[#455546] flex items-center justify-center shadow-inner">
                  <Package className="w-7 h-7 text-[#B69C76]" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-base font-bold text-[#3C4A3C] font-editorial">
                    Inventario Vacío (Sin Insumos Registrados)
                  </h4>
                  <p className="text-xs text-[#6A7869] mt-1.5 leading-relaxed">
                    El catálogo de existencias está completamente limpio. Como administradora, puedes agregar cada tipo de matcha, leches de avena/almendra, vasos PET cristalinos, pitillos o repostería con sus costos y existencias iniciales.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsNewItemModalOpen(true)}
                    className="py-2.5 px-5 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 mx-auto shadow-sm hover:shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#B69C76]" />
                    <span>+ Agregar Primer Insumo al Inventario</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F4] border-b border-[#E6DFD4] text-[#7A8E77] uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Insumo & SKU</th>
                      <th className="py-3 px-4">Departamento</th>
                      <th className="py-3 px-4">Stock Actual</th>
                      <th className="py-3 px-4">Nivel & Estado</th>
                      <th className="py-3 px-4 text-right">Costo Unit.</th>
                      <th className="py-3 px-4 text-right">Valor Total</th>
                      <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD4]">
                    {filteredInventory.map((item) => {
                      const isCritical = item.currentStock <= item.minStock;
                      const isReorder = item.currentStock > item.minStock && item.currentStock <= (item.minStock * 1.5);
                      const isOptimal = item.currentStock > (item.minStock * 1.5);
                      const totalVal = item.currentStock * item.costPerUnit;
                      const maxCapacity = Math.max(item.minStock * 2.5, item.currentStock);
                      const stockPercentage = Math.min(100, (item.currentStock / maxCapacity) * 100);

                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F4]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#3C4A3C]">{item.name}</div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                {item.sku}
                              </span>
                              {item.location && (
                                <span className="flex items-center gap-0.5 text-[#7A8E77]">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF8F4] text-[#455546] border border-[#E6DFD4]">
                              {item.categoryLabel}
                            </span>
                            {item.supplier && (
                              <span className="block text-[10px] text-gray-400 mt-0.5">
                                Prov: {item.supplier}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-base text-[#3C4A3C] font-editorial">
                              {item.currentStock}{' '}
                              <span className="text-xs font-normal text-gray-500 font-sans">
                                {item.unit}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              Mínimo: {item.minStock} {item.unit}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="w-28 space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className={`font-bold ${
                                  isCritical ? 'text-red-600' : isReorder ? 'text-amber-600' : 'text-emerald-700'
                                }`}>
                                  {isCritical ? 'Crítico' : isReorder ? 'Reordenar' : 'Óptimo'}
                                </span>
                                <span className="text-gray-400">{stockPercentage.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isCritical ? 'bg-red-500' : isReorder ? 'bg-amber-500' : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-gray-600">
                            ${item.costPerUnit.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <span className="font-bold text-sm text-[#3C4A3C] font-editorial">
                              ${totalVal.toFixed(2)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 bg-[#FAF8F4] p-1 rounded-xl border border-[#E6DFD4]">
                              <button
                                onClick={() => handleQuickStockDelta(item, -1)}
                                disabled={item.currentStock <= 0}
                                className="w-6 h-6 rounded-lg bg-white border border-[#E6DFD4] text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Restar 1 unidad"
                              >
                                -
                              </button>
                              <span className="px-1 text-xs font-mono font-bold text-[#3C4A3C]">
                                {item.currentStock}
                              </span>
                              <button
                                onClick={() => handleQuickStockDelta(item, 1)}
                                className="w-6 h-6 rounded-lg bg-white border border-[#E6DFD4] text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center font-bold text-xs transition-colors"
                                title="Sumar 1 unidad"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openAdjustModal(item)}
                                className="px-2.5 py-1 rounded-lg bg-[#FAF8F4] border border-[#E6DFD4] hover:bg-[#EBE5DA] text-[11px] font-bold text-[#455546] transition-colors"
                                title="Ajuste detallado de existencias con motivo"
                              >
                                Ajustar
                              </button>
                              <button
                                onClick={() => handleDeleteInventoryItem(item)}
                                className="p-1 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                title="Eliminar del catálogo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR GASTO O VENTA FINANCIERA */}
      {/* ========================================================================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-5 bg-[#FAF8F4] border-b border-[#E6DFD4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  txType === 'ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>
                  {txType === 'ingreso' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-[#3C4A3C] font-editorial">
                  {txType === 'ingreso' ? 'Registrar Venta o Cobro de Evento' : 'Registrar Gasto Operativo de Barra'}
                </h3>
              </div>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E6DFD4] text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-5 space-y-4">
              {/* Type selector */}
              <div className="flex p-1 bg-[#FAF8F4] rounded-2xl border border-[#E6DFD4]">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('gasto');
                    setCategory('insumos_matcha');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    txType === 'gasto'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Gasto Operativo (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('ingreso');
                    setCategory('evento_boda');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    txType === 'ingreso'
                      ? 'bg-[#455546] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Venta / Ingreso (+)
                </button>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Monto en USD ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-sm font-bold text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
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
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Concepto o Descripción *
                </label>
                <input
                  type="text"
                  required
                  placeholder={txType === 'ingreso' ? 'Ej. Abono 50% Boda Las Mercedes' : 'Ej. Compra 2 latas Matcha Ceremonial Uji'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                />
              </div>

              {/* Category and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
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
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  >
                    <option value="efectivo_usd">Efectivo USD</option>
                    <option value="zelle">Zelle</option>
                    <option value="pago_movil">Pago Móvil (Bs)</option>
                    <option value="transferencia">Transferencia Bancaria</option>
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
                className="w-full mt-2 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Guardar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AJUSTAR STOCK DE INVENTARIO */}
      {/* ========================================================================= */}
      {isAdjustModalOpen && adjustTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-5 bg-[#FAF8F4] border-b border-[#E6DFD4] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#B69C76]">
                  Ajuste de Stock
                </span>
                <h3 className="text-base font-bold text-[#3C4A3C] font-editorial">
                  {adjustTargetItem.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E6DFD4] text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustStock} className="p-5 space-y-4">
              {/* Current Stock Banner */}
              <div className="p-3 bg-[#FAF8F4] rounded-2xl border border-[#E6DFD4] flex items-center justify-between text-xs">
                <span className="text-gray-600">Stock Actual en Sistema:</span>
                <span className="font-bold text-[#3C4A3C] text-sm font-editorial">
                  {adjustTargetItem.currentStock} {adjustTargetItem.unit}
                </span>
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('add');
                      setAdjustReason('compra');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      adjustAction === 'add'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white border border-[#E6DFD4] text-gray-600 hover:bg-[#FAF8F4]'
                    }`}
                  >
                    + Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('subtract');
                      setAdjustReason('evento');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      adjustAction === 'subtract'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white border border-[#E6DFD4] text-gray-600 hover:bg-[#FAF8F4]'
                    }`}
                  >
                    - Salida
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('set');
                      setAdjustReason('conteo_fisico');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      adjustAction === 'set'
                        ? 'bg-[#455546] text-white shadow-xs'
                        : 'bg-white border border-[#E6DFD4] text-gray-600 hover:bg-[#FAF8F4]'
                    }`}
                  >
                    = Fijar
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Cantidad ({adjustTargetItem.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0.01"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-base font-bold text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Motivo del Movimiento
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                >
                  <option value="compra">Compra / Reposición de Insumo</option>
                  <option value="evento">Consumo en Evento / Bodas</option>
                  <option value="merma">Merma o Insumo Dañado</option>
                  <option value="conteo_fisico">Ajuste por Conteo Físico</option>
                  <option value="otro">Otro Motivo</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lote de reposición importado"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                />
              </div>

              {/* Auto expense checkbox */}
              {adjustAction === 'add' && adjustReason === 'compra' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={autoRegisterExpense}
                      onChange={(e) => setAutoRegisterExpense(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <div className="text-emerald-900">
                      <span className="font-bold block">
                        Registrar costo automáticamente en Finanzas
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Se añadirá un gasto de ${(parseFloat(adjustQuantity || '0') * adjustTargetItem.costPerUnit).toFixed(2)} USD en la pestaña de Finanzas.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Confirmar Ajuste
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREAR NUEVO INSUMO DE INVENTARIO */}
      {/* ========================================================================= */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-5 bg-[#FAF8F4] border-b border-[#E6DFD4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#B69C76]/20 text-[#455546] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-[#B69C76]" />
                </div>
                <h3 className="text-base font-bold text-[#3C4A3C] font-editorial">
                  Dar de Alta Nuevo Insumo
                </h3>
              </div>
              <button
                onClick={() => setIsNewItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E6DFD4] text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Item Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Nombre del Insumo / Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Matcha Ceremonial Uji Grado Imperial"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                />
              </div>

              {/* SKU and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Código SKU (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. MAT-UJI-100"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs font-mono text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Departamento
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  >
                    <option value="matcha_te">Matcha & Té Ceremonial</option>
                    <option value="lacteos_bebidas">Lácteos & Jarabes</option>
                    <option value="empaques_desechables">Empaques & Vasos PET</option>
                    <option value="reposteria">Repostería & Cookies</option>
                    <option value="merch_accesorios">Merchandising & Barra</option>
                  </select>
                </div>
              </div>

              {/* Stock, Min Stock, Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs font-bold text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Mínimo Alerta *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Unidad
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as any)}
                    className="w-full px-2 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  >
                    <option value="unidades">unidades</option>
                    <option value="latas (100g)">latas (100g)</option>
                    <option value="litros">litros</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="botellas">botellas</option>
                    <option value="paquetes">paquetes</option>
                    <option value="cajas">cajas</option>
                  </select>
                </div>
              </div>

              {/* Cost per unit, Supplier, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Costo Unit. ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs font-bold text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carrito Móvil"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Uji Harvest"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mb-1">
                  Notas de Calidad o Especificación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Grado ceremonial primera cosecha"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6DFD4] rounded-xl text-xs text-[#3C4A3C] focus:outline-none focus:border-[#7A8E77]"
                />
              </div>

              {/* Optional initial cost register */}
              <div className="p-3 bg-[#FAF8F4] border border-[#E6DFD4] rounded-2xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#455546]">
                  <input
                    type="checkbox"
                    checked={registerNewItemExpense}
                    onChange={(e) => setRegisterNewItemExpense(e.target.checked)}
                    className="rounded text-[#455546] focus:ring-[#7A8E77]"
                  />
                  <span>¿Registrar compra inicial de stock como Gasto en Finanzas?</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Dar de Alta Insumo
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

-- ==============================================================================
-- ICHIN By AMSI — Esquema y Políticas de Supabase (amsi-crm)
-- ==============================================================================

-- 1. Extensión para generación de UUIDs únicos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: ichin_cotizaciones
-- Almacena todas las solicitudes detalladas del Cotizador de Barras y Catering
CREATE TABLE IF NOT EXISTS public.ichin_cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_nombre TEXT,
    cliente_telefono TEXT,
    tipo_evento TEXT,
    fecha_evento TEXT,
    lugar_evento TEXT,
    numero_invitados INTEGER,
    paquete_nombre TEXT,
    tipo_montaje TEXT,
    adicionales TEXT[],
    notas_adicionales TEXT,
    resumen_items JSONB,
    estado TEXT DEFAULT 'nuevo',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: leads (CRM de clientes potenciales)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telefono TEXT NOT NULL,
    nombre TEXT,
    origen TEXT DEFAULT 'whatsapp'::text NOT NULL,
    palabra_clave TEXT,
    tipo TEXT DEFAULT 'amazon'::text NOT NULL,
    estado TEXT DEFAULT 'nuevo'::text NOT NULL,
    notas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Habilitar Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.ichin_cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. Conceder permisos de acceso a los roles de Supabase
GRANT ALL ON public.ichin_cotizaciones TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;

-- 6. POLÍTICAS DE ACCESO: ichin_cotizaciones
-- Permitir que usuarios desde la web pública envíen cotizaciones
DROP POLICY IF EXISTS "Permitir insercion anonima de cotizaciones" ON public.ichin_cotizaciones;
CREATE POLICY "Permitir insercion anonima de cotizaciones" 
ON public.ichin_cotizaciones 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permitir lectura de cotizaciones (para confirmaciones inmediatas y panel)
DROP POLICY IF EXISTS "Permitir lectura de cotizaciones" ON public.ichin_cotizaciones;
CREATE POLICY "Permitir lectura de cotizaciones" 
ON public.ichin_cotizaciones 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 7. POLÍTICAS DE ACCESO: leads
-- Permitir que las cotizaciones y pedidos del carrito se registren como leads
DROP POLICY IF EXISTS "Permitir insercion anonima de leads" ON public.leads;
CREATE POLICY "Permitir insercion anonima de leads" 
ON public.leads 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permitir lectura de leads
DROP POLICY IF EXISTS "Permitir lectura de leads" ON public.leads;
CREATE POLICY "Permitir lectura de leads" 
ON public.leads 
FOR SELECT 
TO anon, authenticated 
USING (true);

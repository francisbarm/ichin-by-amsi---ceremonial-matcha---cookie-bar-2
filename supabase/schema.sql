-- ==============================================================================
-- ICHIN By AMSI — Esquema Completo de Supabase
-- Integración con CRM, Notificaciones Resend y WhatsApp
-- ==============================================================================

-- 1. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: ichin_cotizaciones
-- Almacena todas las solicitudes de eventos y barras móviles de matcha
CREATE TABLE IF NOT EXISTS public.ichin_cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_email TEXT,
    tipo_evento TEXT DEFAULT 'Boda' NOT NULL,
    fecha_evento TEXT,
    lugar_evento TEXT DEFAULT 'Caracas',
    numero_invitados INTEGER DEFAULT 50 NOT NULL,
    paquete_nombre TEXT NOT NULL,
    tipo_montaje TEXT DEFAULT 'Barra Estándar',
    adicionales TEXT[] DEFAULT '{}'::TEXT[],
    notas_adicionales TEXT,
    resumen_items JSONB DEFAULT '{}'::JSONB,
    estado TEXT DEFAULT 'nuevo' NOT NULL, -- 'nuevo', 'contactado', 'confirmado', 'completado', 'cancelado'
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: leads (CRM Unificado de AMSI)
-- Captura a cada cliente potencial que cotiza o consulta por WhatsApp
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT,
    telefono TEXT NOT NULL,
    email TEXT,
    origen TEXT DEFAULT 'web_cotizador_ichin' NOT NULL, -- 'web_cotizador_ichin', 'web_carrito_ichin', 'whatsapp'
    palabra_clave TEXT,
    tipo TEXT DEFAULT 'catering_matcha' NOT NULL,
    estado TEXT DEFAULT 'nuevo' NOT NULL, -- 'nuevo', 'calificado', 'negociacion', 'cerrado_ganado', 'perdido'
    notas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. TABLA: notificaciones (Registro de envíos Resend Email y WhatsApp)
-- Guarda la trazabilidad de cada correo enviado y cada alerta generada
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotizacion_id UUID REFERENCES public.ichin_cotizaciones(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- 'email_confirmacion', 'whatsapp_alerta', 'resumen_admin'
    proveedor TEXT NOT NULL, -- 'resend', 'whatsapp'
    destinatario TEXT NOT NULL, -- Correo o teléfono
    asunto TEXT,
    estado TEXT DEFAULT 'enviado' NOT NULL, -- 'enviado', 'fallido', 'simulado_sin_api_key'
    error_mensaje TEXT,
    detalles JSONB DEFAULT '{}'::JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Índices para consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_cotizaciones_creado_en ON public.ichin_cotizaciones (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON public.ichin_cotizaciones (estado);
CREATE INDEX IF NOT EXISTS idx_leads_creado_en ON public.leads (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_cotizacion ON public.notificaciones (cotizacion_id);

-- 6. Habilitar Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.ichin_cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- 7. Concesión de Permisos
GRANT ALL ON public.ichin_cotizaciones TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;
GRANT ALL ON public.notificaciones TO anon, authenticated, service_role;

-- 8. Políticas RLS para ichin_cotizaciones
DROP POLICY IF EXISTS "Permitir insercion de cotizaciones" ON public.ichin_cotizaciones;
CREATE POLICY "Permitir insercion de cotizaciones" 
ON public.ichin_cotizaciones 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de cotizaciones" ON public.ichin_cotizaciones;
CREATE POLICY "Permitir lectura de cotizaciones" 
ON public.ichin_cotizaciones 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 9. Políticas RLS para leads
DROP POLICY IF EXISTS "Permitir insercion de leads" ON public.leads;
CREATE POLICY "Permitir insercion de leads" 
ON public.leads 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de leads" ON public.leads;
CREATE POLICY "Permitir lectura de leads" 
ON public.leads 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 10. Políticas RLS para notificaciones
DROP POLICY IF EXISTS "Permitir insercion de notificaciones" ON public.notificaciones;
CREATE POLICY "Permitir insercion de notificaciones" 
ON public.notificaciones 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de notificaciones" ON public.notificaciones;
CREATE POLICY "Permitir lectura de notificaciones" 
ON public.notificaciones 
FOR SELECT 
TO anon, authenticated 
USING (true);

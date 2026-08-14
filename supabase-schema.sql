-- ============================================================
-- Demo Danny - Gestión de Inmuebles Bogotá
-- Schema PUBLIC - Prefijo house_
-- ============================================================

-- ============================================================
-- Tablas de catálogos (lookup tables)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.house_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.house_property_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.house_transaction_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.house_localities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.house_strata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE CHECK (level BETWEEN 1 AND 6),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.house_property_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.house_appointment_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Tabla de usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS public.house_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(300),
  locality_id UUID REFERENCES public.house_localities(id),
  stratum_id UUID REFERENCES public.house_strata(id),
  role_id UUID NOT NULL REFERENCES public.house_roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Tabla de inmuebles
-- ============================================================

CREATE TABLE IF NOT EXISTS public.house_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  description TEXT,
  address VARCHAR(300) NOT NULL,
  neighborhood VARCHAR(150),
  locality_id UUID NOT NULL REFERENCES public.house_localities(id),
  stratum_id UUID NOT NULL REFERENCES public.house_strata(id),
  property_type_id UUID NOT NULL REFERENCES public.house_property_types(id),
  transaction_type_id UUID NOT NULL REFERENCES public.house_transaction_types(id),
  state_id UUID NOT NULL REFERENCES public.house_property_states(id),
  price NUMERIC(15, 2) NOT NULL,
  admin_fee NUMERIC(12, 2) DEFAULT 0,
  area_m2 NUMERIC(8, 2) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  parking_spaces INTEGER NOT NULL DEFAULT 0,
  floor_number INTEGER,
  has_balcony BOOLEAN DEFAULT false,
  has_elevator BOOLEAN DEFAULT false,
  has_gym BOOLEAN DEFAULT false,
  has_pool BOOLEAN DEFAULT false,
  has_security BOOLEAN DEFAULT false,
  year_built INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.house_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Tabla de archivos multimedia (fotos y videos)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.house_property_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.house_properties(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('photo', 'video')),
  file_name VARCHAR(250) NOT NULL,
  file_size INTEGER,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Tabla de citas / visitas
-- ============================================================

CREATE TABLE IF NOT EXISTS public.house_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.house_properties(id),
  user_id UUID NOT NULL REFERENCES public.house_users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  state_id UUID NOT NULL REFERENCES public.house_appointment_states(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Tabla de favoritos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.house_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.house_properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.house_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- ============================================================
-- Índices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_house_users_role ON public.house_users(role_id);
CREATE INDEX IF NOT EXISTS idx_house_users_locality ON public.house_users(locality_id);

CREATE INDEX IF NOT EXISTS idx_house_properties_locality ON public.house_properties(locality_id);
CREATE INDEX IF NOT EXISTS idx_house_properties_type ON public.house_properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_house_properties_transaction ON public.house_properties(transaction_type_id);
CREATE INDEX IF NOT EXISTS idx_house_properties_state ON public.house_properties(state_id);
CREATE INDEX IF NOT EXISTS idx_house_properties_created_by ON public.house_properties(created_by);
CREATE INDEX IF NOT EXISTS idx_house_properties_active ON public.house_properties(is_active);
CREATE INDEX IF NOT EXISTS idx_house_properties_price ON public.house_properties(price);

CREATE INDEX IF NOT EXISTS idx_house_media_property ON public.house_property_media(property_id);
CREATE INDEX IF NOT EXISTS idx_house_media_cover ON public.house_property_media(property_id, is_cover);

CREATE INDEX IF NOT EXISTS idx_house_appointments_property ON public.house_appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_house_appointments_user ON public.house_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_house_appointments_date ON public.house_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_house_appointments_state ON public.house_appointments(state_id);

CREATE INDEX IF NOT EXISTS idx_house_favorites_user ON public.house_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_house_favorites_property ON public.house_favorites(property_id);

-- ============================================================
-- Triggers para updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.house_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_house_users_updated_at ON public.house_users;
CREATE TRIGGER trigger_house_users_updated_at
  BEFORE UPDATE ON public.house_users
  FOR EACH ROW EXECUTE FUNCTION public.house_update_updated_at();

DROP TRIGGER IF EXISTS trigger_house_properties_updated_at ON public.house_properties;
CREATE TRIGGER trigger_house_properties_updated_at
  BEFORE UPDATE ON public.house_properties
  FOR EACH ROW EXECUTE FUNCTION public.house_update_updated_at();

DROP TRIGGER IF EXISTS trigger_house_appointments_updated_at ON public.house_appointments;
CREATE TRIGGER trigger_house_appointments_updated_at
  BEFORE UPDATE ON public.house_appointments
  FOR EACH ROW EXECUTE FUNCTION public.house_update_updated_at();

-- ============================================================
-- Datos iniciales de catálogos
-- ============================================================

-- Roles
INSERT INTO public.house_roles (name, description) VALUES
  ('admin', 'Administrador del sistema - puede gestionar inmuebles'),
  ('user', 'Usuario común - puede ver inmuebles y agendar citas')
ON CONFLICT (name) DO NOTHING;

-- Tipos de inmueble
INSERT INTO public.house_property_types (name) VALUES
  ('Apartamento'),
  ('Casa'),
  ('Estudio'),
  ('Lote'),
  ('Oficina'),
  ('Local Comercial')
ON CONFLICT (name) DO NOTHING;

-- Tipos de transacción (necesidad)
INSERT INTO public.house_transaction_types (name) VALUES
  ('Venta'),
  ('Arriendo')
ON CONFLICT (name) DO NOTHING;

-- Localidades de Bogotá
INSERT INTO public.house_localities (name) VALUES
  ('Usaquén'),
  ('Chapinero'),
  ('Santa Fe'),
  ('San Cristóbal'),
  ('Usme'),
  ('Tunjuelito'),
  ('Bosa'),
  ('Kennedy'),
  ('Fontibón'),
  ('Engativá'),
  ('Suba'),
  ('Barrios Unidos'),
  ('Teusaquillo'),
  ('Los Mártires'),
  ('Antonio Nariño'),
  ('Puente Aranda'),
  ('La Candelaria'),
  ('Rafael Uribe Uribe'),
  ('Ciudad Bolívar'),
  ('Sumapaz')
ON CONFLICT (name) DO NOTHING;

-- Estratos
INSERT INTO public.house_strata (level, name) VALUES
  (1, 'Estrato 1 - Bajo-bajo'),
  (2, 'Estrato 2 - Bajo'),
  (3, 'Estrato 3 - Medio-bajo'),
  (4, 'Estrato 4 - Medio'),
  (5, 'Estrato 5 - Medio-alto'),
  (6, 'Estrato 6 - Alto')
ON CONFLICT (level) DO NOTHING;

-- Estados del inmueble
INSERT INTO public.house_property_states (name) VALUES
  ('Disponible'),
  ('Reservado'),
  ('Vendido'),
  ('Arrendado')
ON CONFLICT (name) DO NOTHING;

-- Estados de cita
INSERT INTO public.house_appointment_states (name) VALUES
  ('Pendiente'),
  ('Confirmada'),
  ('Completada'),
  ('Cancelada')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.house_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_strata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_property_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_appointment_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (ajustar en producción)
CREATE POLICY "Allow all on house_roles" ON public.house_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_property_types" ON public.house_property_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_transaction_types" ON public.house_transaction_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_localities" ON public.house_localities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_strata" ON public.house_strata FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_property_states" ON public.house_property_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_appointment_states" ON public.house_appointment_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_users" ON public.house_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_properties" ON public.house_properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_property_media" ON public.house_property_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_appointments" ON public.house_appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_favorites" ON public.house_favorites FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Storage Bucket para archivos multimedia
-- ============================================================
-- Ejecutar manualmente en Supabase Dashboard > Storage:
-- Crear bucket: "property-media" (público)
-- Políticas: permitir upload a usuarios autenticados con rol admin

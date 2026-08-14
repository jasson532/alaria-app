-- ============================================================
-- Demo Danny - Contactos y Agendas de visitas
-- Ejecutar DESPUÉS del schema principal
-- ============================================================

-- Tabla de contactos (personas que atienden las visitas)
CREATE TABLE IF NOT EXISTS public.house_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de agendas (fechas disponibles por inmueble)
CREATE TABLE IF NOT EXISTS public.house_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.house_properties(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.house_contacts(id),
  schedule_date DATE NOT NULL,
  schedule_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_house_contacts_active ON public.house_contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_house_schedules_property ON public.house_schedules(property_id);
CREATE INDEX IF NOT EXISTS idx_house_schedules_available ON public.house_schedules(property_id, is_available);
CREATE INDEX IF NOT EXISTS idx_house_schedules_date ON public.house_schedules(schedule_date);

-- RLS
ALTER TABLE public.house_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on house_contacts" ON public.house_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on house_schedules" ON public.house_schedules FOR ALL USING (true) WITH CHECK (true);

-- Contactos de prueba
INSERT INTO public.house_contacts (full_name, phone) VALUES
  ('Jasson Bolaños', '3173415300'),
  ('Daniela Tavera', '3242848747'),
  ('Wheimar Bolaños', '3145642628')
ON CONFLICT DO NOTHING;

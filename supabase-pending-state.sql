-- Agregar estado 'Pendiente' para inmuebles con registro flash
INSERT INTO public.house_property_states (name) VALUES ('Pendiente')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Demo Danny - Datos de prueba
-- Ejecutar DESPUÉS del schema principal
-- ============================================================

-- ============================================================
-- Usuarios de prueba
-- ============================================================

INSERT INTO public.house_users (email, password, full_name, phone, address, locality_id, stratum_id, role_id)
VALUES
  ('carlos.admin@demo.com', '123456', 'Carlos Rodríguez', '3001234567', 'Cra 15 #85-10', 
    (SELECT id FROM public.house_localities WHERE name = 'Chapinero'),
    (SELECT id FROM public.house_strata WHERE level = 4),
    (SELECT id FROM public.house_roles WHERE name = 'admin')),
  ('maria.usuario@demo.com', '123456', 'María López', '3109876543', 'Cll 140 #12-30',
    (SELECT id FROM public.house_localities WHERE name = 'Usaquén'),
    (SELECT id FROM public.house_strata WHERE level = 5),
    (SELECT id FROM public.house_roles WHERE name = 'user')),
  ('andres.perez@demo.com', '123456', 'Andrés Pérez', '3201112233', 'Cra 7 #45-20',
    (SELECT id FROM public.house_localities WHERE name = 'Teusaquillo'),
    (SELECT id FROM public.house_strata WHERE level = 3),
    (SELECT id FROM public.house_roles WHERE name = 'user')),
  ('laura.garcia@demo.com', '123456', 'Laura García', '3154445566', 'Cll 72 #10-50',
    (SELECT id FROM public.house_localities WHERE name = 'Barrios Unidos'),
    (SELECT id FROM public.house_strata WHERE level = 3),
    (SELECT id FROM public.house_roles WHERE name = 'user'))
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Inmuebles de prueba (10 propiedades en Bogotá)
-- ============================================================

INSERT INTO public.house_properties (
  title, description, address, neighborhood, locality_id, stratum_id,
  property_type_id, transaction_type_id, state_id, price, admin_fee,
  area_m2, bedrooms, bathrooms, parking_spaces, floor_number,
  has_balcony, has_elevator, has_gym, has_pool, has_security,
  year_built, latitude, longitude, is_active, created_by
) VALUES
-- 1. Apartamento Venta - Usaquén
(
  'Apartamento moderno en Usaquén con vista panorámica',
  'Hermoso apartamento de 3 habitaciones con acabados de lujo, cocina abierta tipo americano, piso en porcelanato, closets empotrados y vista despejada hacia los cerros orientales. Conjunto con zonas verdes y salón social.',
  'Cra 7 #140-25, Apto 1502',
  'Santa Bárbara',
  (SELECT id FROM public.house_localities WHERE name = 'Usaquén'),
  (SELECT id FROM public.house_strata WHERE level = 5),
  (SELECT id FROM public.house_property_types WHERE name = 'Apartamento'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Venta'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  650000000, 850000, 120, 3, 2, 2, 15,
  true, true, true, false, true,
  2019, 4.7110, -74.0321, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 2. Casa Venta - Suba
(
  'Casa esquinera amplia en Suba - Ideal para familia',
  'Casa de 4 habitaciones con patio trasero amplio, zona de BBQ, estudio independiente. Ubicada en conjunto cerrado con vigilancia 24 horas, parque infantil y cancha múltiple. Excelente ubicación cerca a colegios y centros comerciales.',
  'Cll 145 #90-15',
  'Niza',
  (SELECT id FROM public.house_localities WHERE name = 'Suba'),
  (SELECT id FROM public.house_strata WHERE level = 4),
  (SELECT id FROM public.house_property_types WHERE name = 'Casa'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Venta'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  520000000, 450000, 180, 4, 3, 2, null,
  false, false, false, false, true,
  2015, 4.7320, -74.0830, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 3. Apartamento Arriendo - Chapinero
(
  'Estudio amoblado en Chapinero Alto - Ideal ejecutivos',
  'Moderno estudio completamente amoblado y equipado. Cocina integral, zona de lavandería, internet incluido. Edificio con portería 24h y terraza comunal con vista 360°. A pasos del Parque de la 93 y zona gastronómica.',
  'Cra 13 #85-40, Apto 804',
  'Chapinero Alto',
  (SELECT id FROM public.house_localities WHERE name = 'Chapinero'),
  (SELECT id FROM public.house_strata WHERE level = 4),
  (SELECT id FROM public.house_property_types WHERE name = 'Estudio'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Arriendo'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  2800000, 350000, 45, 1, 1, 0, 8,
  true, true, false, false, true,
  2021, 4.6690, -74.0550, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 4. Apartamento Venta - Engativá
(
  'Apartamento familiar en Engativá - Precio oportunidad',
  'Apartamento de 3 habitaciones bien distribuido, closets de madera, cocina semi-integral. Conjunto con parqueadero cubierto, salón comunal y parque para niños. Cerca a TransMilenio y Portal 80.',
  'Cll 80 #110-30, Apto 503',
  'Álamos',
  (SELECT id FROM public.house_localities WHERE name = 'Engativá'),
  (SELECT id FROM public.house_strata WHERE level = 3),
  (SELECT id FROM public.house_property_types WHERE name = 'Apartamento'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Venta'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  280000000, 320000, 72, 3, 2, 1, 5,
  false, true, false, false, true,
  2017, 4.6930, -74.1170, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 5. Casa Arriendo - Kennedy
(
  'Casa amplia para arriendo en Kennedy - 3 pisos',
  'Casa de 3 pisos con 5 habitaciones, ideal para familia numerosa. Primer piso con local comercial independiente. Terraza amplia con buena vista. Cerca al centro comercial Plaza de las Américas.',
  'Cra 78B #41-15 Sur',
  'Carvajal',
  (SELECT id FROM public.house_localities WHERE name = 'Kennedy'),
  (SELECT id FROM public.house_strata WHERE level = 3),
  (SELECT id FROM public.house_property_types WHERE name = 'Casa'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Arriendo'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  2200000, 0, 150, 5, 3, 0, null,
  false, false, false, false, false,
  2005, 4.6280, -74.1500, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 6. Apartamento Venta - Teusaquillo
(
  'Pent-house dúplex en Teusaquillo con terraza privada',
  'Espectacular pent-house dúplex con terraza de 40m², jacuzzi privado, chimenea a gas. Acabados en mármol y madera. Doble altura en sala. Vista a los cerros. Zona tranquila y arborizada.',
  'Cll 39A #14-25, PH',
  'La Soledad',
  (SELECT id FROM public.house_localities WHERE name = 'Teusaquillo'),
  (SELECT id FROM public.house_strata WHERE level = 4),
  (SELECT id FROM public.house_property_types WHERE name = 'Apartamento'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Venta'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  890000000, 1200000, 200, 3, 3, 2, 12,
  true, true, true, true, true,
  2022, 4.6360, -74.0680, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 7. Local Comercial - Fontibón
(
  'Local comercial sobre vía principal - Fontibón',
  'Excelente local comercial de esquina sobre la Av. Centenario. Ideal para restaurante, tienda o oficina. Dos baños, bodega interna, vitrina amplia con buena visibilidad. Alto flujo peatonal y vehicular.',
  'Av. Centenario #100-55',
  'Fontibón Centro',
  (SELECT id FROM public.house_localities WHERE name = 'Fontibón'),
  (SELECT id FROM public.house_strata WHERE level = 3),
  (SELECT id FROM public.house_property_types WHERE name = 'Local Comercial'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Arriendo'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  5500000, 200000, 85, 0, 2, 0, 1,
  false, false, false, false, false,
  2010, 4.6780, -74.1440, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 8. Apartamento Arriendo - Barrios Unidos
(
  'Apartamento remodelado cerca a la 72 - Excelente ubicación',
  'Apartamento totalmente remodelado, cocina nueva tipo americano, pisos en laminado, baño moderno. Excelente ubicación a 2 cuadras de la calle 72. Transporte, comercio y vida nocturna a la mano.',
  'Cll 72 #52-18, Apto 302',
  'Alcázares',
  (SELECT id FROM public.house_localities WHERE name = 'Barrios Unidos'),
  (SELECT id FROM public.house_strata WHERE level = 3),
  (SELECT id FROM public.house_property_types WHERE name = 'Apartamento'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Arriendo'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  1800000, 180000, 55, 2, 1, 0, 3,
  false, false, false, false, true,
  2012, 4.6610, -74.0780, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 9. Oficina Venta - Santa Fe (Centro)
(
  'Oficina corporativa en el Centro Internacional',
  'Oficina de alto nivel en el Centro Internacional de Bogotá. Piso completo con sala de juntas, recepción, 4 oficinas privadas. Edificio inteligente con sistema de seguridad biométrico. Parqueadero para 3 vehículos.',
  'Cra 7 #32-12, Of. 901',
  'Centro Internacional',
  (SELECT id FROM public.house_localities WHERE name = 'Santa Fe'),
  (SELECT id FROM public.house_strata WHERE level = 4),
  (SELECT id FROM public.house_property_types WHERE name = 'Oficina'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Venta'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  420000000, 950000, 110, 0, 2, 3, 9,
  false, true, false, false, true,
  2018, 4.6195, -74.0700, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
),
-- 10. Apartamento Venta - Bosa
(
  'Apartamento nuevo en Bosa - Proyecto VIS terminado',
  'Apartamento nuevo de 2 habitaciones, entrega inmediata. Conjunto con zonas verdes, parque infantil, salón comunal. Subsidio aplicable. Cerca a colegios, supermercados y TransMilenio. Excelente inversión.',
  'Cll 65 Sur #80C-20, Apto 204',
  'Bosa El Recreo',
  (SELECT id FROM public.house_localities WHERE name = 'Bosa'),
  (SELECT id FROM public.house_strata WHERE level = 2),
  (SELECT id FROM public.house_property_types WHERE name = 'Apartamento'),
  (SELECT id FROM public.house_transaction_types WHERE name = 'Venta'),
  (SELECT id FROM public.house_property_states WHERE name = 'Disponible'),
  145000000, 150000, 48, 2, 1, 1, 2,
  false, false, false, false, true,
  2024, 4.5960, -74.1890, true,
  (SELECT id FROM public.house_users WHERE email = 'jasson.udenar@gmail.com')
);

-- ============================================================
-- Citas de prueba
-- ============================================================

INSERT INTO public.house_appointments (property_id, user_id, appointment_date, appointment_time, notes, state_id)
SELECT 
  p.id,
  u.id,
  '2026-08-15',
  '10:00',
  'Me interesa mucho este apartamento, quisiera verlo el sábado',
  (SELECT id FROM public.house_appointment_states WHERE name = 'Pendiente')
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Usaquén%' AND u.email = 'maria.usuario@demo.com'
LIMIT 1;

INSERT INTO public.house_appointments (property_id, user_id, appointment_date, appointment_time, notes, state_id)
SELECT 
  p.id,
  u.id,
  '2026-08-16',
  '14:30',
  'Quiero ver la casa con mi esposa',
  (SELECT id FROM public.house_appointment_states WHERE name = 'Confirmada')
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Suba%' AND u.email = 'andres.perez@demo.com'
LIMIT 1;

INSERT INTO public.house_appointments (property_id, user_id, appointment_date, appointment_time, notes, state_id)
SELECT 
  p.id,
  u.id,
  '2026-08-12',
  '09:00',
  null,
  (SELECT id FROM public.house_appointment_states WHERE name = 'Completada')
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Chapinero%' AND u.email = 'laura.garcia@demo.com'
LIMIT 1;

INSERT INTO public.house_appointments (property_id, user_id, appointment_date, appointment_time, notes, state_id)
SELECT 
  p.id,
  u.id,
  '2026-08-18',
  '11:00',
  'Necesito parqueadero, confirmar disponibilidad',
  (SELECT id FROM public.house_appointment_states WHERE name = 'Pendiente')
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Teusaquillo%' AND u.email = 'maria.usuario@demo.com'
LIMIT 1;

-- ============================================================
-- Favoritos de prueba
-- ============================================================

INSERT INTO public.house_favorites (property_id, user_id)
SELECT p.id, u.id
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Usaquén%' AND u.email = 'maria.usuario@demo.com'
LIMIT 1;

INSERT INTO public.house_favorites (property_id, user_id)
SELECT p.id, u.id
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Teusaquillo%' AND u.email = 'maria.usuario@demo.com'
LIMIT 1;

INSERT INTO public.house_favorites (property_id, user_id)
SELECT p.id, u.id
FROM public.house_properties p, public.house_users u
WHERE p.title LIKE '%Chapinero%' AND u.email = 'andres.perez@demo.com'
LIMIT 1;

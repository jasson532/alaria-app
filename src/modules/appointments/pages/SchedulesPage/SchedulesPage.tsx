import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { supabase } from 'modules/shared/services/supabase';
import type { ContactItem } from 'modules/catalogs/types';
import './SchedulesPage.scss';

interface PropertyOption {
  id: string;
  title: string;
}

interface Schedule {
  id: string;
  schedule_date: string;
  schedule_time: string;
  is_available: boolean;
  house_contacts: { full_name: string; phone: string };
}

const SchedulesPage = () => {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newContact, setNewContact] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (selectedProperty) loadSchedules();
  }, [selectedProperty]);

  const loadOptions = async () => {
    const [propRes, contRes] = await Promise.all([
      supabase.from('house_properties').select('id, title').eq('is_active', true).order('title'),
      supabase.from('house_contacts').select('*').eq('is_active', true).order('full_name'),
    ]);
    setProperties(propRes.data || []);
    setContacts(contRes.data || []);
  };

  const loadSchedules = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('house_schedules')
      .select('*, house_contacts(full_name, phone)')
      .eq('property_id', selectedProperty)
      .order('schedule_date', { ascending: true })
      .order('schedule_time', { ascending: true });
    setSchedules(data || []);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!newDate || !newTime || !newContact || !selectedProperty) return;
    await supabase.from('house_schedules').insert({
      property_id: selectedProperty,
      contact_id: newContact,
      schedule_date: newDate,
      schedule_time: newTime,
    });
    setNewDate('');
    setNewTime('');
    setNewContact('');
    setIsAdding(false);
    loadSchedules();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta fecha?')) return;
    await supabase.from('house_schedules').delete().eq('id', id);
    loadSchedules();
  };

  return (
    <div className="schedules-page">
      <h1 className="schedules-page__title">Gestión de Agendas</h1>
      <p className="schedules-page__subtitle">Asigna fechas disponibles para visitas por inmueble</p>

      <div className="schedules-page__selector">
        <label className="schedules-page__label">Seleccionar inmueble</label>
        <select
          className="schedules-page__select"
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
        >
          <option value="">-- Seleccionar inmueble --</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {selectedProperty && (
        <div className="schedules-page__content">
          <div className="schedules-page__header">
            <h3 className="schedules-page__content-title">
              <Calendar size={18} />
              Fechas disponibles
            </h3>
            <button className="schedules-page__add-btn" onClick={() => setIsAdding(true)}>
              <Plus size={16} />
              Agregar fecha
            </button>
          </div>

          {isAdding && (
            <div className="schedules-page__form">
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              <select value={newContact} onChange={(e) => setNewContact(e.target.value)}>
                <option value="">Contacto...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} - {c.phone}</option>
                ))}
              </select>
              <div className="schedules-page__form-actions">
                <button className="schedules-page__save-btn" onClick={handleAdd} disabled={!newDate || !newTime || !newContact}>Guardar</button>
                <button className="schedules-page__cancel-btn" onClick={() => setIsAdding(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <p style={{ padding: '1rem', color: '#6b7280' }}>Cargando...</p>
          ) : schedules.length === 0 ? (
            <p className="schedules-page__empty">No hay fechas registradas para este inmueble</p>
          ) : (
            <div className="schedules-page__list">
              {schedules.map((s) => (
                <div key={s.id} className={`schedules-page__item ${!s.is_available ? 'schedules-page__item--taken' : ''}`}>
                  <div className="schedules-page__item-info">
                    <span className="schedules-page__item-date">
                      {format(new Date(s.schedule_date + 'T00:00:00'), 'EEEE dd MMM yyyy', { locale: es })}
                    </span>
                    <span className="schedules-page__item-time">{s.schedule_time.slice(0, 5)}</span>
                  </div>
                  <div className="schedules-page__item-contact">
                    <span>{s.house_contacts?.full_name}</span>
                    <span className="schedules-page__item-phone">{s.house_contacts?.phone}</span>
                  </div>
                  <div className="schedules-page__item-status">
                    <span className={`schedules-page__badge ${s.is_available ? 'schedules-page__badge--available' : 'schedules-page__badge--taken'}`}>
                      {s.is_available ? 'Disponible' : 'Reservada'}
                    </span>
                  </div>
                  <button className="schedules-page__delete-btn" onClick={() => handleDelete(s.id)} aria-label="Eliminar" title="Eliminar fecha">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;

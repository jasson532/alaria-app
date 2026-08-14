import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from 'modules/shared/services/supabase';
import { useConfirm } from 'modules/shared/hooks/useConfirm';
import { useLoader } from 'modules/shared/hooks/useLoader';
import ConfirmModal from 'modules/shared/components/molecules/ConfirmModal/ConfirmModal';
import SearchSelect from 'modules/shared/components/molecules/SearchSelect/SearchSelect';
import type { ContactItem } from 'modules/catalogs/types';
import './SchedulesManager.scss';

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

const SchedulesManager = () => {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const getToday = () => new Date().toISOString().split('T')[0];

  const [newDate, setNewDate] = useState(getToday());
  const [newTime, setNewTime] = useState(getCurrentTime());
  const [newContact, setNewContact] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const modal = useConfirm();
  const { withLoader } = useLoader();

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
    await withLoader(async () => {
      await supabase.from('house_schedules').insert({
        property_id: selectedProperty,
        contact_id: newContact,
        schedule_date: newDate,
        schedule_time: newTime,
      });
    });
    setNewDate(getToday());
    setNewTime(getCurrentTime());
    setNewContact('');
    setIsAdding(false);
    loadSchedules();
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'Eliminar agenda',
      message: '¿Eliminar esta fecha de agenda?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await withLoader(async () => {
          await supabase.from('house_schedules').delete().eq('id', id);
        });
        loadSchedules();
        modal.close();
      },
    });
  };

  const propertyOptions = properties.map((p) => ({ value: p.id, label: p.title }));
  const contactOptions = contacts.map((c) => ({ value: c.id, label: `${c.full_name} - ${c.phone}` }));

  return (
    <div className="schedules-mgr">
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={modal.close}
      />

      <div className="schedules-mgr__selector">
        <label className="schedules-mgr__label">Seleccionar inmueble</label>
        <SearchSelect
          options={propertyOptions}
          value={selectedProperty}
          onChange={setSelectedProperty}
          placeholder="Buscar inmueble..."
        />
      </div>

      {selectedProperty && (
        <div className="schedules-mgr__content">
          <div className="schedules-mgr__header">
            <h3 className="schedules-mgr__content-title">
            </h3>
            <button className="schedules-mgr__add-btn" onClick={() => setIsAdding(true)} title="Agregar fecha">
              <Plus size={18} />
            </button>
          </div>

          {isAdding && (
            <div className="schedules-mgr__form">
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Hora" />
              <SearchSelect
                options={contactOptions}
                value={newContact}
                onChange={setNewContact}
                placeholder="Asesor..."
              />
              <div className="schedules-mgr__form-actions">
                <button className="schedules-mgr__save-btn" onClick={handleAdd} disabled={!newDate || !newTime || !newContact}>Guardar</button>
                <button className="schedules-mgr__cancel-btn" onClick={() => setIsAdding(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <p style={{ padding: '1rem', color: '#6b7280' }}>Cargando...</p>
          ) : schedules.length === 0 ? (
            <p className="schedules-mgr__empty">No hay fechas registradas para este inmueble</p>
          ) : (
            <div className="schedules-mgr__list">
              {schedules.map((s) => (
                <div key={s.id} className={`schedules-mgr__item ${!s.is_available ? 'schedules-mgr__item--taken' : ''}`}>
                  <div className="schedules-mgr__item-info">
                    <span className="schedules-mgr__item-date">
                      {format(new Date(s.schedule_date + 'T00:00:00'), 'EEEE dd MMM yyyy', { locale: es })}
                    </span>
                    <span className="schedules-mgr__item-time">{s.schedule_time.slice(0, 5)}</span>
                  </div>
                  <div className="schedules-mgr__item-contact">
                    <span>{s.house_contacts?.full_name}</span>
                    <span className="schedules-mgr__item-phone">{s.house_contacts?.phone}</span>
                  </div>
                  <span className={`schedules-mgr__badge ${s.is_available ? 'schedules-mgr__badge--available' : 'schedules-mgr__badge--taken'}`}>
                    {s.is_available ? 'Disponible' : 'Reservada'}
                  </span>
                  <button className="schedules-mgr__delete-btn" onClick={() => handleDelete(s.id)} title="Eliminar">
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

export default SchedulesManager;

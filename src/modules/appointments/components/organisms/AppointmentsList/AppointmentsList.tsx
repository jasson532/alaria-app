import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, X, MapPin, Phone, User, Calendar, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { fetchAllAppointments, fetchUserAppointments, updateAppointmentState, deleteAppointment } from 'modules/appointments/store/appointmentsSlice';
import { useConfirm } from 'modules/shared/hooks/useConfirm';
import { supabase } from 'modules/shared/services/supabase';
import ConfirmModal from 'modules/shared/components/molecules/ConfirmModal/ConfirmModal';
import type { AppointmentWithRelations } from 'modules/appointments/types';
import './AppointmentsList.scss';

interface AppointmentDetail {
  appointment: AppointmentWithRelations;
  contact: { full_name: string; phone: string } | null;
}

const AppointmentsList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useAppSelector((state) => state.appointments);
  const { user, role } = useAppSelector((state) => state.auth);
  const [filterText, setFilterText] = useState('');
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const modal = useConfirm();
  const { withLoader } = useLoader();

  useEffect(() => {
    if (role === 'admin') {
      dispatch(fetchAllAppointments());
    } else if (user?.id) {
      dispatch(fetchUserAppointments(user.id));
    }
  }, [dispatch, role, user?.id]);

  const handleRowClick = async (appointment: AppointmentWithRelations) => {
    // Buscar contacto de la agenda asociada al inmueble
    const { data } = await supabase
      .from('house_schedules')
      .select('house_contacts(full_name, phone)')
      .eq('property_id', appointment.property_id)
      .limit(1);

    const contact = data && data.length > 0
      ? (data[0].house_contacts as unknown as { full_name: string; phone: string })
      : null;
    setDetail({ appointment, contact });
  };

  const handleUpdateState = (id: string, stateName: string) => {
    modal.confirm({
      title: stateName === 'Cancelada' ? 'Cancelar cita' : stateName === 'Confirmada' ? 'Confirmar cita' : 'Completar cita',
      message: `¿Estás seguro de cambiar el estado a "${stateName}"?`,
      confirmLabel: stateName,
      variant: stateName === 'Cancelada' ? 'warning' : 'info',
      onConfirm: async () => {
        await withLoader(async () => {
          await dispatch(updateAppointmentState({ id, stateName }));
        });
        modal.close();
      },
    });
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Eliminar cita',
      message: 'Esta acción eliminará la cita permanentemente. ¿Continuar?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await withLoader(async () => {
          await dispatch(deleteAppointment(id));
        });
        modal.close();
      },
    });
  };

  const getStateBadgeClass = (name: string) => {
    const key = name.toLowerCase();
    if (key === 'pendiente') return 'appts-list__badge--pendiente';
    if (key === 'confirmada') return 'appts-list__badge--confirmada';
    if (key === 'completada') return 'appts-list__badge--completada';
    if (key === 'cancelada') return 'appts-list__badge--cancelada';
    return '';
  };

  const filteredItems = role === 'admin' && filterText
    ? items.filter((a) =>
        a.house_users?.full_name?.toLowerCase().includes(filterText.toLowerCase()) ||
        a.house_properties?.title?.toLowerCase().includes(filterText.toLowerCase())
      )
    : items;

  if (isLoading) return <p style={{ padding: '1rem', color: '#6b7280' }}>Cargando...</p>;

  return (
    <div className="appts-list">
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={modal.close}
      />

      {/* Dialog detalle */}
      {detail && (
        <div className="appts-list__dialog-overlay" onClick={() => setDetail(null)}>
          <div className="appts-list__dialog" onClick={(e) => e.stopPropagation()}>
            <button className="appts-list__dialog-close" onClick={() => setDetail(null)}>
              <X size={20} />
            </button>
            <h3 className="appts-list__dialog-title">{detail.appointment.house_properties?.title}</h3>
            <div className="appts-list__dialog-info">
              <div className="appts-list__dialog-row">
                <MapPin size={16} />
                <span>{detail.appointment.house_properties?.address}</span>
              </div>
              <div className="appts-list__dialog-row">
                <Calendar size={16} />
                <span>
                  {format(new Date(detail.appointment.appointment_date + 'T00:00:00'), 'EEEE dd MMM yyyy', { locale: es })} - {detail.appointment.appointment_time.slice(0, 5)}
                </span>
              </div>
              {role === 'admin' && (
                <div className="appts-list__dialog-row">
                  <User size={16} />
                  <span>{detail.appointment.house_users?.full_name} ({detail.appointment.house_users?.email})</span>
                </div>
              )}
              {detail.contact && (
                <div className="appts-list__dialog-row appts-list__dialog-row--contact">
                  <Phone size={16} />
                  <span>Asesor: <strong>{detail.contact.full_name}</strong> - {detail.contact.phone}</span>
                </div>
              )}
              {detail.appointment.notes && (
                <p className="appts-list__dialog-notes">"{detail.appointment.notes}"</p>
              )}
            </div>
            <button
              className="appts-list__dialog-link"
              onClick={() => navigate(`/inmuebles/${detail.appointment.property_id}`)}
            >
              <ExternalLink size={16} />
              Inmueble
            </button>
          </div>
        </div>
      )}

      {role === 'admin' && (
        <div className="appts-list__filter">
          <Search size={16} className="appts-list__filter-icon" />
          <input
            className="appts-list__filter-input"
            type="text"
            placeholder="Filtrar por cliente o inmueble..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="appts-list__empty">
          {filterText ? 'No se encontraron resultados' : 'No hay citas registradas'}
        </div>
      ) : (
        <div className="appts-list__table-container">
          <table className="appts-list__table">
            <thead>
              <tr>
                <th>Inmueble</th>
                {role === 'admin' && <th>Cliente</th>}
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th className="appts-list__hide-mobile">Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((appointment) => {
                const stateName = appointment.house_appointment_states?.name || '';
                const canUserCancel = role === 'user' && (stateName === 'Pendiente' || stateName === 'Confirmada');

                return (
                  <tr key={appointment.id} onClick={() => handleRowClick(appointment)} className="appts-list__row">
                    <td>
                      <span className="appts-list__property-name">
                        {appointment.house_properties?.title}
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td>{appointment.house_users?.full_name}</td>
                    )}
                    <td>
                      {format(new Date(appointment.appointment_date + 'T00:00:00'), 'dd MMM', { locale: es })}
                    </td>
                    <td>{appointment.appointment_time.slice(0, 5)}</td>
                    <td>
                      <span className={`appts-list__badge ${getStateBadgeClass(stateName)}`}>
                        {stateName}
                      </span>
                    </td>
                    <td className="appts-list__hide-mobile">{appointment.notes || '-'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="appts-list__actions">
                        {role === 'admin' && (
                          <>
                            {stateName === 'Pendiente' && (
                              <>
                                <button className="appts-list__action-btn appts-list__action-btn--confirm" onClick={() => handleUpdateState(appointment.id, 'Confirmada')}>
                                  Confirmar
                                </button>
                                <button className="appts-list__action-btn appts-list__action-btn--cancel" onClick={() => handleUpdateState(appointment.id, 'Cancelada')}>
                                  Cancelar
                                </button>
                              </>
                            )}
                            {stateName === 'Confirmada' && (
                              <button className="appts-list__action-btn appts-list__action-btn--complete" onClick={() => handleUpdateState(appointment.id, 'Completada')}>
                                Completar
                              </button>
                            )}
                            <button className="appts-list__action-btn appts-list__action-btn--delete" onClick={() => handleDelete(appointment.id)} title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {canUserCancel && (
                          <button className="appts-list__action-btn appts-list__action-btn--cancel" onClick={() => handleUpdateState(appointment.id, 'Cancelada')}>
                            Cancelar
                          </button>
                        )}
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
  );
};

export default AppointmentsList;

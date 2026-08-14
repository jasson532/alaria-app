import { useState } from 'react';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import AppointmentsList from 'modules/appointments/components/organisms/AppointmentsList/AppointmentsList';
import SchedulesManager from 'modules/appointments/components/organisms/SchedulesManager/SchedulesManager';
import './AppointmentsPage.scss';

const AppointmentsPage = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedules'>('appointments');

  return (
    <div className="appointments-page">
      <h1 className="appointments-page__title">
        {role === 'admin' ? 'Citas y Agendas' : 'Mis Citas'}
      </h1>
      <p className="appointments-page__subtitle">
        {role === 'admin' ? 'Gestiona las visitas y crea horarios disponibles' : 'Tus visitas programadas'}
      </p>

      {role === 'admin' && (
        <div className="appointments-page__tabs">
          <button
            className={`appointments-page__tab ${activeTab === 'appointments' ? 'appointments-page__tab--active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Citas recibidas
          </button>
          <button
            className={`appointments-page__tab ${activeTab === 'schedules' ? 'appointments-page__tab--active' : ''}`}
            onClick={() => setActiveTab('schedules')}
          >
            Crear agendas
          </button>
        </div>
      )}

      {activeTab === 'appointments' && <AppointmentsList />}
      {activeTab === 'schedules' && role === 'admin' && <SchedulesManager />}
    </div>
  );
};

export default AppointmentsPage;

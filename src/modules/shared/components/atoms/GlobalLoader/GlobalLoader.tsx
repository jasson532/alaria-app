import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import './GlobalLoader.scss';

const GlobalLoader = () => {
  const { loadingCount } = useAppSelector((state) => state.ui);

  if (loadingCount === 0) return null;

  return (
    <div className="global-loader">
      <div className="global-loader__card">
        <img src="/logo-alaria-loader.svg" alt="Cargando..." className="global-loader__logo" />
      </div>
    </div>
  );
};

export default GlobalLoader;

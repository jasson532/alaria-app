import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { checkSession } from 'modules/auth/store/authSlice';
import Loader from 'modules/shared/components/atoms/Loader/Loader';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AppInitializer;

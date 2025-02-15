import { useDebugValue, useMemo } from 'react';
import { usePathForm } from './usePathForm';
import { usePathFormSubscription } from './usePathFormSubscription';

export const usePathFormErrors = () => {
  const renders = usePathFormSubscription('errors');
  const { state } = usePathForm();

  useDebugValue(state.current.errors);

  return useMemo(() => {
    return state.current.errors;
    // ignore state ref dependency
    // eslint-disable-next-line
  }, [renders]);
};

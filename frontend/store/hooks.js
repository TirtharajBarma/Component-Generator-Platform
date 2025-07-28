import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Convenience hooks for different slices
export const useAuth = () => useAppSelector((state) => state.auth);
export const useSession = () => useAppSelector((state) => state.session);
export const useUI = () => useAppSelector((state) => state.ui);

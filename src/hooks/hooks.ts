import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useIsOwner = (): boolean => {
    const selectedGroupId = useAppSelector((state) => state.roles.selectedGroupId);
    const group = useAppSelector((state) =>
      state.roles.groups.find((g) => g.group_name_id === selectedGroupId)
    );
    // Keep legacy hook name, but allow write access for owner and editor roles.
    return group?.role === "owner" || group?.role === "editor";
  };

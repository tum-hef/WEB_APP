import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import type { Group } from '../store/types';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useSelectedGroupRole = (): Group["role"] | null => {
    const selectedGroupId = useAppSelector((state) => state.roles.selectedGroupId);
    const groups = useAppSelector((state) => state.roles.groups);

    if (!selectedGroupId) return null;

    const matchedGroups = groups.filter(
      (g) => g.group_name_id === selectedGroupId || g.id === selectedGroupId
    );

    if (matchedGroups.length === 0) return null;
    const resolveRole = (group: Group): Group["role"] => {
      const permissions = (group.permissions || []).map((p) => String(p).toLowerCase());
      if (permissions.includes("owners")) return "owner";
      if (permissions.includes("editors")) return "editor";
      if (permissions.includes("readers")) return "reader";
      return group.role;
    };

    if (matchedGroups.length === 1) return resolveRole(matchedGroups[0]);

    const selectedOthers = localStorage.getItem("selected_others") === "true";

    if (selectedOthers) {
      const memberMatch = matchedGroups.find((g) => g.role !== "owner");
      return memberMatch ? resolveRole(memberMatch) : resolveRole(matchedGroups[0]);
    }

    const ownerMatch = matchedGroups.find((g) => g.role === "owner");
    return ownerMatch ? resolveRole(ownerMatch) : resolveRole(matchedGroups[0]);
  };

export const useIsOwner = (): { isOwner: boolean; role: Group["role"] | null } => {
    const role = useSelectedGroupRole();
    // Keep legacy hook name, but allow write access for owner and editor roles.
    return {
      isOwner: role === "owner" || role === "editor",
      role,
    };
  };

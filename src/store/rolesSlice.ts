import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RolesState, Group, ClientsResponse } from './types';

const initialState: RolesState = {
  groups: [],
  clients: [],
  selectedGroupId: null,
};

export const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setGroups(state, action: PayloadAction<Group[]>) {
      state.groups = action.payload;
    },
    setClients(state, action: PayloadAction<ClientsResponse[]>) {
      state.clients = action.payload;
    },
    setSelectedGroupId(state, action: PayloadAction<string>) {
      state.selectedGroupId = action.payload;
    },
  },
});

export const { setGroups, setClients, setSelectedGroupId } = rolesSlice.actions;
export default rolesSlice.reducer;

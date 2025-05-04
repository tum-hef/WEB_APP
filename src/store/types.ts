export interface GroupAttributes {
    project_name?: string[];
    project_description?: string[];
    [key: string]: any;
  }
  
  export interface Group {
    id: string;
    group_name_id: string;
    parent_group_id: string | null;
    project_name: string | null;
    project_description: string | null;
    attributes: GroupAttributes;
    permissions: string[];
    role: 'owner' | 'reader';
  }
  
  export interface ClientRoleMapping {
    client: string;
    id: string;
    mappings: {
      id: string;
      name: string;
      containerId: string;
      clientRole: boolean;
      composite: boolean;
    }[];
  }
  
  export interface ClientsResponse {
    clientMappings: {
      [clientName: string]: ClientRoleMapping;
    };
  }
  
  export interface RolesState {
    groups: Group[];
    clients: ClientsResponse[];
    selectedGroupId: string | null;
  }
  
import { Employee } from './employee';

export interface RequestItem {
    id?: number;
    name: string;
    quantity: number;
    description?: string;
}

export interface Request {
    id?: number;
    employeeId: number;
    type: string;
    requestItems: RequestItem[];
    status: string;
    createdDate?: string;
    description?: string;
    employee?: Employee;
    
    // Add runtime properties used by the UI
    refreshing?: boolean;
    updating?: boolean;
}

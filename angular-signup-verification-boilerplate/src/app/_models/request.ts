import { Employee } from './employee';

export interface RequestItem {
    id?: number;
    requestId?: number;
    name: string;
    quantity: number;
    details?: string;
}

export interface Request {
    id?: number;
    employeeId: number;
    type: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestItems?: RequestItem[];
    
    // Optional navigation properties
    Employee?: Employee;
}

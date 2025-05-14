import { Employee } from './employee';

export interface Workflow {
    id?: number;
    employeeId: number;
    type: string;
    details: any; // Could be a more specific type based on workflow type
    status: 'Pending' | 'Approved' | 'Rejected';
    
    // Optional navigation properties
    Employee?: Employee;
}

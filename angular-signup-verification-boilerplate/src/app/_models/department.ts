import { Employee } from './employee';

export interface Department {
    id?: number;
    name: string;
    description: string;
    employeeCount?: number;
    
    // Optional navigation properties
    Employees?: Employee[];
}

import { Department } from './department';

export interface Employee {
    id?: number;
    employeeId: string;
    userId: number;
    position: string;
    departmentId: number;
    hireDate: string;
    status: string;
    
    // Optional navigation properties
    Department?: Department;
    User?: any;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Department } from '@app/_models';

const baseUrl = `${environment.apiUrl}/departments`;

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    // Local cache of departments to speed up loading
    private departmentsCache: Department[] = [];
    
    constructor(private http: HttpClient) { }

    getAll() {
        // If we have cached departments, return them immediately
        if (this.departmentsCache.length > 0) {
            return of(this.departmentsCache);
        }
        
        return this.http.get<Department[]>(baseUrl).pipe(
            map(departments => {
                this.departmentsCache = departments; // Cache the results
                return departments;
            }),
            catchError(error => {
                console.error('Error loading departments:', error);
                // Return default departments if API fails
                const defaultDepts = [
                    { id: 1, name: 'Engineering', description: 'Software development team', employeeCount: 1 },
                    { id: 2, name: 'Marketing', description: 'Marketing team', employeeCount: 1 }
                ];
                this.departmentsCache = defaultDepts;
                return of(defaultDepts);
            })
        );
    }

    getById(id: string) {
        // If we have the department in cache, return it immediately
        const cachedDept = this.departmentsCache.find(d => d.id === parseInt(id));
        if (cachedDept) {
            return of(cachedDept);
        }
        
        return this.http.get<Department>(`${baseUrl}/${id}`).pipe(
            catchError(error => {
                console.error(`Error fetching department ID ${id}:`, error);
                
                // Try to get it from the full departments list
                return this.getAll().pipe(
                    map(departments => {
                        const dept = departments.find(d => d.id === parseInt(id));
                        if (!dept) {
                            throw new Error(`Department with ID ${id} not found`);
                        }
                        return dept;
                    })
                );
            })
        );
    }

    create(department: Department) {
        return this.http.post<Department>(baseUrl, department);
    }

    update(id: string, params: any) {
        return this.http.put<Department>(`${baseUrl}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`);
    }
}

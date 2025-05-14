import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Employee } from '@app/_models';

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Employee[]> {
        return this.http.get<Employee[]>(baseUrl);
    }    getById(id: string): Observable<Employee> {
        return this.http.get<Employee>(`${baseUrl}/${id}`);
    }

    create(params: Employee): Observable<Employee> {
        return this.http.post<Employee>(baseUrl, params);
    }

    update(id: string, params: Employee): Observable<Employee> {
        return this.http.put<Employee>(`${baseUrl}/${id}`, params);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${baseUrl}/${id}`);
    }
    
    transfer(id: string, params: { departmentId: number }): Observable<any> {
        return this.http.post(`${baseUrl}/${id}/transfer`, params);
    }

    getEmployeeWorkflows(id: string): Observable<any[]> {
        // Changed to match the fake backend's expected URL
        return this.http.get<any[]>(`${environment.apiUrl}/workflows/employee/${id}`);
    }
}

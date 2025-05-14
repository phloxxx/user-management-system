import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Workflow } from '@app/_models';

export interface RequestItem {
  id?: number;
  name: string;
  quantity: number;
  description?: string;
}

export interface Request {
  id: number;
  type: string;
  description?: string;
  status: string;
  requesterName?: string;
  requesterId?: string;
  dateSubmitted: Date;
  dateUpdated?: Date;
  approverName?: string;
  approverId?: string;
  comments?: string;
  employee?: {
    id: string;
    employeeId: string;
    firstName?: string;
    lastName?: string;
  };
  requestItems?: RequestItem[];
}

const baseUrl = `${environment.apiUrl}/workflows`;

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  constructor(private http: HttpClient) { }

  getByEmployeeId(employeeId: number): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${baseUrl}/employee/${employeeId}`);
  }

  create(workflow: Workflow): Observable<Workflow> {
    return this.http.post<Workflow>(baseUrl, workflow);
  }

  updateStatus(id: number, status: 'Pending' | 'Approved' | 'Rejected'): Observable<Workflow> {
    return this.http.put<Workflow>(`${baseUrl}/${id}/status`, { status });
  }

  createOnboarding(params: { employeeId: number, details: any }): Observable<Workflow> {
    return this.http.post<Workflow>(`${baseUrl}/onboarding`, params);
  }

  // Get all requests
  getAllRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(`${baseUrl}/requests`).pipe(
      catchError(() => {
        // Mock data if API fails or doesn't exist yet
        return of([
          { 
            id: 1, 
            type: 'Equipment Request', 
            status: 'Pending',
            dateSubmitted: new Date('2023-11-01'),
            employee: { id: '1', employeeId: 'EMP001', firstName: 'John', lastName: 'Doe' },
            requestItems: [
              { id: 1, name: 'Laptop', quantity: 1, description: 'MacBook Pro 16"' },
              { id: 2, name: 'Monitor', quantity: 2, description: '27" 4K Display' }
            ]
          },
          { 
            id: 2, 
            type: 'Office Supplies', 
            status: 'Approved',
            dateSubmitted: new Date('2023-10-25'),
            dateUpdated: new Date('2023-10-26'),
            employee: { id: '2', employeeId: 'EMP002', firstName: 'Jane', lastName: 'Smith' },
            requestItems: [
              { id: 3, name: 'Notebook', quantity: 5 },
              { id: 4, name: 'Pens', quantity: 20 }
            ],
            approverName: 'Admin User',
            approverId: 'admin-id'
          },
          { 
            id: 3, 
            type: 'Training Request', 
            status: 'Rejected',
            dateSubmitted: new Date('2023-10-15'),
            dateUpdated: new Date('2023-10-17'),
            employee: { id: '3', employeeId: 'EMP003', firstName: 'Mike', lastName: 'Johnson' },
            requestItems: [
              { id: 5, name: 'Angular Course', quantity: 1, description: 'Advanced Angular Training' }
            ],
            approverName: 'Admin User',
            approverId: 'admin-id',
            comments: 'Budget constraints, please resubmit next quarter'
          }
        ]).pipe(delay(1000)); // Add artificial delay to simulate network
      })
    );
  }

  // Get requests for a specific user
  getUserRequests(userId: string): Observable<Request[]> {
    return this.http.get<Request[]>(`${baseUrl}/requests/user/${userId}`).pipe(
      catchError(() => {
        // Mock filtered data
        return this.getAllRequests().pipe(
          map(requests => requests.filter(req => req.employee?.id === userId))
        );
      })
    );
  }

  // Get a specific request by ID
  getRequestById(id: number): Observable<Request> {
    return this.http.get<Request>(`${baseUrl}/requests/${id}`).pipe(
      catchError(() => {
        // Mock data for a specific request
        return this.getAllRequests().pipe(
          map(requests => requests.find(req => req.id === id))
        );
      })
    );
  }

  // Create a new request
  createRequest(request: Partial<Request>): Observable<Request> {
    return this.http.post<Request>(`${baseUrl}/requests`, request).pipe(
      catchError(() => {
        // Mock creating a request
        const newRequest: Request = {
          id: Math.floor(Math.random() * 1000) + 10,
          status: 'Pending',
          dateSubmitted: new Date(),
          ...request
        } as Request;
        return of(newRequest).pipe(delay(500));
      })
    );
  }

  // Update request status (approve/reject)
  updateRequestStatus(id: number, status: string, comments?: string): Observable<Request> {
    return this.http.put<Request>(`${baseUrl}/requests/${id}/status`, { status, comments }).pipe(
      catchError(() => {
        // Mock updating status
        return this.getRequestById(id).pipe(
          map(request => {
            return {
              ...request,
              status,
              comments,
              dateUpdated: new Date()
            };
          }),
          delay(500)
        );
      })
    );
  }

  // Delete a request
  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/requests/${id}`).pipe(
      catchError(() => {
        // Mock delete operation
        return of(undefined).pipe(delay(500));
      })
    );
  }

  // Update a request
  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${baseUrl}/requests/${id}`, request).pipe(
      catchError(() => {
        // Mock update operation
        const updatedRequest = {
          ...request,
          id,
          dateUpdated: new Date()
        } as Request;
        return of(updatedRequest).pipe(delay(500));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Request } from '@app/_models';

const baseUrl = `${environment.apiUrl}/requests`;

@Injectable({ providedIn: 'root' })
export class RequestService {
    // Add cache for requests to improve loading speed
    private requestsCache: Request[] = [];
    private requestByIdCache: Map<string, Request> = new Map();
    // Add a cache for storing user-created requests
    private userCreatedRequests: Map<string, Request> = new Map();

    constructor(private http: HttpClient) { }

    getAll(): Observable<Request[]> {
        // Return cached data if available
        if (this.requestsCache.length > 0) {
            console.log('Using cached requests data');
            return of(this.requestsCache);
        }

        return this.http.get<Request[]>(baseUrl).pipe(
            tap(requests => {
                console.log('Caching requests data:', requests.length);
                this.requestsCache = requests;
                
                // Also cache individual requests by ID
                requests.forEach(request => {
                    if (request.id) {
                        this.requestByIdCache.set(request.id.toString(), request);
                    }
                });
            }),
            catchError(error => {
                console.error('Error getting all requests:', error);
                throw error;
            })
        );
    }

    // Updated to remove all mock data
    getById(id: string): Observable<Request> {
        const idStr = id.toString();
        console.log(`Getting request with ID: ${idStr}`);
        
        // First check user created requests (highest priority)
        const userCreated = this.userCreatedRequests.get(idStr);
        if (userCreated) {
            console.log('Found user-created request:', userCreated);
            return of(userCreated);
        }
        
        // Check if we have this request in our by-ID cache
        const cachedRequest = this.requestByIdCache.get(idStr);
        if (cachedRequest) {
            console.log(`Using cached request for ID ${idStr}`);
            return of(cachedRequest);
        }
        
        // Not in cache, fetch from API
        return this.http.get<Request>(`${baseUrl}/${id}`).pipe(
            tap(request => {
                console.log('Retrieved request data from API');
                this.requestByIdCache.set(idStr, request);
            }),
            catchError(error => {
                console.error(`Error retrieving request with ID ${id}:`, error);
                throw error;
            })
        );
    }

    create(request: Request): Observable<Request> {
        // Generate a new ID if none exists
        if (!request.id) {
            request.id = Math.floor(Math.random() * 10000) + 100;
        }
      
        // Save the request in our local cache
        const savedRequest = { ...request };
        console.log('Saving new request to local cache:', savedRequest);
        this.userCreatedRequests.set(savedRequest.id.toString(), savedRequest);
        this.requestByIdCache.set(savedRequest.id.toString(), savedRequest);
        
        return this.http.post<Request>(baseUrl, request).pipe(
            tap(createdRequest => {
                // Update cache with the server response
                if (createdRequest && createdRequest.id) {
                    this.requestByIdCache.set(createdRequest.id.toString(), createdRequest);
                }
            }),
            catchError(error => {
                console.error('Error creating request:', error);
                // Return the locally saved request as fallback
                return of(savedRequest);
            })
        );
    }

    update(id: string, params: any): Observable<Request> {
        // Update our local cache
        const idStr = id.toString();
        const existingRequest = this.getRequestFromCache(idStr);
        
        if (existingRequest) {
            const updatedRequest = { ...existingRequest, ...params };
            console.log('Updating request in local cache:', updatedRequest);
            this.userCreatedRequests.set(idStr, updatedRequest);
            this.requestByIdCache.set(idStr, updatedRequest);
            
            return this.http.put<Request>(`${baseUrl}/${id}`, params).pipe(
                tap(responseRequest => {
                    // Update cache with server response
                    this.requestByIdCache.set(idStr, responseRequest);
                }),
                catchError(error => {
                    console.error(`Error updating request ${id}:`, error);
                    // Return the locally updated request as fallback
                    return of(updatedRequest);
                })
            );
        }
        
        return this.http.put<Request>(`${baseUrl}/${id}`, params).pipe(
            catchError(error => {
                console.error(`Error updating request ${id}:`, error);
                throw error;
            })
        );
    }

    // Helper method to get request from either cache
    private getRequestFromCache(id: string): Request {
        // First check user created requests
        const userCreated = this.userCreatedRequests.get(id);
        if (userCreated) {
            return userCreated;
        }
        
        // Then check regular cache
        return this.requestByIdCache.get(id) || null;
    }

    delete(id: string): Observable<any> {
        // Remove from caches
        const idStr = id.toString();
        this.userCreatedRequests.delete(idStr);
        this.requestByIdCache.delete(idStr);
        
        return this.http.delete<any>(`${baseUrl}/${id}`).pipe(
            catchError(error => {
                console.error(`Error deleting request ${id}:`, error);
                throw error;
            })
        );
    }

    getByEmployee(employeeId: number): Observable<Request[]> {
        return this.http.get<Request[]>(`${baseUrl}/employee/${employeeId}`).pipe(
            catchError(error => {
                console.error(`Error getting requests for employee ${employeeId}:`, error);
                throw error;
            })
        );
    }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Account } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private baseUrl = `${environment.apiUrl}/accounts`;
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${this.baseUrl}/authenticate`, { email, password }, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        this.http.post<any>(`${this.baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    refreshToken() {
        return this.http.post<any>(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: Account) {
        return this.http.post(`${this.baseUrl}/register`, account, { withCredentials: true });
    }

    verifyEmail(token: string) {
        return this.http.post(`${this.baseUrl}/verify-email`, { token }, { withCredentials: true });
    }

    forgotPassword(email: string) {
        return this.http.post(`${this.baseUrl}/forgot-password`, { email }, { withCredentials: true });
    }

    validateResetToken(token: string) {
        return this.http.post(`${this.baseUrl}/validate-reset-token`, { token }, { withCredentials: true });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${this.baseUrl}/reset-password`, { token, password, confirmPassword }, { withCredentials: true });
    }

    getAll() {
        return this.http.get<Account[]>(this.baseUrl, { withCredentials: true });
    }

    getById(id: string) {
        return this.http.get<Account>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    create(params) {
        return this.http.post(this.baseUrl, params, { withCredentials: true });
    }

    update(id, params) {
        return this.http.put(`${this.baseUrl}/${id}`, params, { withCredentials: true })
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true })
            .pipe(finalize(() => {
                // auto logout if the logged in account deleted their own record
                if (id === this.accountValue.id)
                    this.logout();
            }));
    }

    // helper methods

    private refreshTokenTimeout;

    private startRefreshTokenTimer() {
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}
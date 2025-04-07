import { AccountService } from '@app/_services';
export function appInitializer(accountService: AccountService) {
    return () => new Promise(resolve => {
        // attempt to refresh token on app start up to auto authenticate
        accountService.refreshToken()
            .subscribe({
                next: () => {
                    console.log('Token refresh successful');
                },
                error: err => {
                    console.error('Token refresh failed', err);
                    // Continue with application initialization even if token refresh fails
                }
            })
            .add(resolve); // resolve when refresh token request completes  
    });
}
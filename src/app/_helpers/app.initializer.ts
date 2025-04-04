import { AccountService } from '@app/_services';
export function appInitializer(accountService: AccountService) {
    return () => new Promise(resolve => {
        // attempt to refresh token on app start up to auto authenticate
        accountService.refreshToken()
            .suscribe()
            .add(resolve); // resolve when refresh token request completes  
    });
}
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';

import { environment } from '@environments/environment';
import { AccountService } from '@app/_services';

export function jwtInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {

    const accountService = inject(AccountService);
    const user = accountService.userValue;
    const isLoggedIn = user?.token;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    if (isLoggedIn && isApiUrl) {
        request = request.clone({
            setHeaders: { Authorization: `Bearer ${user.token}` }
        });
    }

    return next(request);
}

import { HttpRequest, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

const usersKey = 'angular-neoris-users';
let users: any[] = JSON.parse(localStorage.getItem(usersKey)!) || [];

export function fakeBackendInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {
    const { url, method, headers, body } = request;

    return handleRoute();

    function handleRoute() {
        switch (true) {
            case url.endsWith('/users/authenticate') && method === 'POST':
                return authenticate();
            case url.endsWith('/users/register') && method === 'POST':
                return register();
            case url.endsWith('/users') && method === 'GET':
                return getUsers();
            case url.match(/\/users\/\d+$/) && method === 'GET':
                return getUserById();
            case url.match(/\/users\/\d+$/) && method === 'PUT':
                return updateUser();
            case url.match(/\/users\/\d+$/) && method === 'DELETE':
                return deleteUser();
            default:
                return next(request);
        }
    }

    function authenticate() {
        const { correo, password } = body;
        const user = users.find(x => x.correo === correo && x.password === password);
        if (!user) return error('Correo y/o contraseña incorrecta');
        return ok({
            ...basicDetails(user),
            token: 'fake-jwt-token'
        })
    }

    function register() {
        const user = body

        if (users.find(x => x.correo === user.correo)) {
            return error('Correo "' + user.correo + '" ya está registrado')
        }

        user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
        users.push(user);
        localStorage.setItem(usersKey, JSON.stringify(users));
        return ok();
    }

    function getUsers() {
        if (!isLoggedIn()) return unauthorized();
        return ok(users.map(x => basicDetails(x)));
    }

    function getUserById() {
        if (!isLoggedIn()) return unauthorized();

        const user = users.find(x => x.id === idFromUrl());
        return ok(basicDetails(user));
    }

    function updateUser() {
        if (!isLoggedIn()) return unauthorized();

        let params = body;
        let user = users.find(x => x.id === idFromUrl());

        if (!params.password) {
            delete params.password;
        }


        Object.assign(user, params);
        localStorage.setItem(usersKey, JSON.stringify(users));

        return ok();
    }

    function deleteUser() {
        if (!isLoggedIn()) return unauthorized();

        users = users.filter(x => x.id !== idFromUrl());
        localStorage.setItem(usersKey, JSON.stringify(users));
        return ok();
    }


    function ok(body?: any) {
        return of(new HttpResponse({ status: 200, body }))
            .pipe(delay(500));
    }

    function error(message: string) {
        return throwError(() => ({ error: { message } }))
            .pipe(materialize(), delay(500), dematerialize());
    }

    function unauthorized() {
        return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
            .pipe(materialize(), delay(500), dematerialize());
    }

    function basicDetails(user: any) {
        const { id, correo, nombre, rol } = user;
        return { id, correo, nombre, rol };
    }

    function isLoggedIn() {
        return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }

    function idFromUrl() {
        const urlParts = url.split('/');
        return parseInt(urlParts[urlParts.length - 1]);
    }
}

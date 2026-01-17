const http = require('http');
const { URL } = require('url');

class Application {
    constructor() {
        this.middlewares = [];
        this.routes = { GET: [], POST: [] }; // Поддерживаем GET и POST
    }

    // middleware
    use(fn) {
        this.middlewares.push(fn);
    }

    // routes
    get(path, handler) { this.routes.GET.push({ path, handler }); }
    post(path, handler) { this.routes.POST.push({ path, handler }); }

    // start
    listen(port, cb) {
        const server = http.createServer((req, res) => {
            this._handleRequest(req, res).catch((e) => {
                console.error(e);
                if (!res.writableEnded) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            });
        });
        server.listen(port, cb);
    }

    async _handleRequest(req, res) {
        // extend req/res
        this._extendResponse(res);
        await this._extendRequest(req);

        // find route
        const found = this._findRoute(req.method, req.pathname);
        req.params = found ? found.params : {};

        // queue: middlewares + route handler
        const queue = [...this.middlewares];
        if (found) queue.push(found.handler);

        // run
        await this._runMiddlewares(req, res, queue);
    }

    _extendResponse(res) {
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };

        res.send = (data) => {
            if (res.writableEnded) return;
            if (typeof data === 'string' || Buffer.isBuffer(data)) {
                res.end(data);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
            }
        };

        res.json = (data) => {
            if (res.writableEnded) return;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        };
    }

    async _extendRequest(req) {
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        req.query = Object.fromEntries(urlObj.searchParams);
        req.pathname = urlObj.pathname;

        // parse body (теперь нужен для POST-запросов)
        req.body = await new Promise((resolve) => {
            let body = '';

            req.on('data', (chunk) => (body += chunk.toString()));
            req.on('end', () => {
                if (!body) return resolve({});
                try {
                    resolve(JSON.parse(body));
                } catch {
                    resolve({}); // невалидный JSON — просто пустой объект
                }
            });
            req.on('error', () => resolve({}));
        });
    }

    _findRoute(method, pathname) {
        const routes = this.routes[method];
        if (!routes) return null;

        for (const r of routes) {
            const routeParts = r.path.split('/').filter(Boolean);
            const reqParts = pathname.split('/').filter(Boolean);

            if (routeParts.length !== reqParts.length) continue;

            const params = {};
            let ok = true;

            for (let i = 0; i < routeParts.length; i++) {
                const rp = routeParts[i];
                const qp = reqParts[i];

                if (rp.startsWith(':')) {
                    params[rp.slice(1)] = qp;
                } else if (rp !== qp) {
                    ok = false;
                    break;
                }
            }

            if (ok) return { handler: r.handler, params };
        }

        return null;
    }

    async _runMiddlewares(req, res, queue) {
        let i = 0;

        const next = async () => {
            if (res.writableEnded) return;

            if (i >= queue.length) {
                res.status(404).json({ error: 'Route not found' });
                return;
            }

            const fn = queue[i++];

            try {
                const maybePromise = fn(req, res, next);
                if (maybePromise && typeof maybePromise.then === 'function') {
                    await maybePromise;
                }
            } catch (e) {
                console.error(e);
                if (!res.writableEnded) {
                    res.status(500).json({ error: 'Internal Server Error', details: e.message });
                }
            }
        };

        await next();
    }
}

module.exports = Application;

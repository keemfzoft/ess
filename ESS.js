/* ESS (Ephemeral Storage Solution)
 * Temporary data storage that is scoped per browser tab or window.
 * Data is cleared when the browser tab or window is closed.
 * Can handle a maximum ~5MB data limit across modern browsers like Chrome, Firefox and Edge while ~2.5MB on Safari.
 * May not function in incognito mode.
 */

export class ESS {
    constructor() {
        this.hooks = [];
        this.stores = [];
    }

    addHook(key, callback) {
        this.hooks.push({
            key,
            callback,
        });
    }

    addStore(name) {
        const e = this;

        if (typeof name === "string") {
            name = name.trim();

            if (name) {
                if (!e.hasOwnProperty(name)) {
                    e.stores.push(name);

                    Object.defineProperty(e, name, {
                        get() {
                            return new Store(name, e);
                        },
                    });
                }
            }
        }
    }
}

class Store {
    constructor(name, ess) {
        this.ess = ess;
        this.name = name;

        const registry = sessionStorage.getItem(this.name);

        if (typeof registry !== "string") {
            sessionStorage.setItem(name, btoa(JSON.stringify({})));
        }
    }

    get(key) {
        const registry = JSON.parse(atob(sessionStorage.getItem(this.name)));

        if (typeof key === "string") {
            const data = key.split(".").reduce((o, k) => {
                if (o && typeof o === "object" && k in o) {
                    return o[k];
                }
    
                return undefined;
            }, registry);

            return data;
        }

        return registry;
    }

    set(key, payload) {
        let registry = JSON.parse(atob(sessionStorage.getItem(this.name)));

        if (typeof key === "string") {
            key.split(".").reduce((o, k, i, arr) => {
                if (i === arr.length - 1) {
                    o[k] = payload;
                } else {
                    if (!o[k] || typeof o[k] !== "object") {
                        o[k] = {};
                    }

                    return o[k];
                }
            }, registry);
        } else {
            registry = payload;
        }

        sessionStorage.setItem(this.name, btoa(JSON.stringify(registry)));

        for (let hook of this.ess.hooks) {
            if (hook.key === `${this.name}.${key}`) {
                hook.callback(this.get(key));
            }   
        }
    }

    update(key, payload = null) {
        const { data } = useHelper();

        let registry = JSON.parse(atob(sessionStorage.getItem(this.name)));
        
        if (typeof key === "string") {
            key.split(".").reduce((o, k, i, arr) => {
                if (i === arr.length - 1) {
                    if ((Array.isArray(o[k]) && Array.isArray(payload)) || (typeof o[k] === "object" && data.isEmpty(o[k]) && Array.isArray(payload))) {
                        o[k] = [...o[k], ...payload];
                    } else if (typeof o[k] === "object" && !data.isEmpty(o[k]) && typeof payload === "object") {
                        o[k] = {...o[k], ...payload};
                    } else {
                        o[k] = payload;
                    }
                } else {
                    if (!o[k] || typeof o[k] !== "object") {
                        o[k] = {};
                    }

                    return o[k];
                }
            }, registry);

            sessionStorage.setItem(this.name, btoa(JSON.stringify(registry)));
        } else {
            payload = key;

            this.set(payload);
        }
    }
}

function useHelper() {
    return {
        data: {
            isEmpty(obj) {
                return obj && Object.keys(obj).length === 0;
            },
        },
    }
}
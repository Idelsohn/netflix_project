export class APIUsage {
    constructor() {
        this.baseURL = "http://localhost:3000/api";
    }

    // ---------- User API methods ----------
    async getUser(username) {
        const res = await fetch(this.baseURL + "/users/" + username);
        return res.json();
    }

    async authenticateUser(username, password) {
        const res = await fetch(this.baseURL + "/users/authenticate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // specify JSON content type
            },
            credentials: 'include', // include cookies
            body: JSON.stringify({ username, password })
        });
        return res.json();
    }

    async createUser(username, email, password) {
        const res = await fetch(this.baseURL + "/users/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        return res.json();
    }
}

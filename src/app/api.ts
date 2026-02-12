// api.ts
const BASE = 'http://localhost:4000/api';

async function request(path: string, opts: any = {}) {
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

// ... phần code còn lại giữ nguyên


export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t } : {};
}

export const api = {
  auth: {
    register: (u: string, p: string) => request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) }),
    login: (u: string, p: string) => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) })
    ,
    me: () => request('/auth/me', { headers: { ...authHeader() } })
  },
  sessions: {
    list: () => request('/sessions'),
    get: (id: string) => request('/sessions/' + id)
  },
  bets: {
    place: (sessionId: string, choice: string, amount: number, choiceValue?: number) => request('/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(choiceValue !== undefined ? { sessionId, choice, amount, choiceValue } : { sessionId, choice, amount })
    })
  },
  tx: {
    deposit: (amount: number) => request('/tx/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ amount }) }),
    withdraw: (amount: number) => request('/tx/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ amount }) }),
    me: () => request('/tx/me', { headers: { ...authHeader() } })
  }
};

export default api;

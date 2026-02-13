// api.ts
export const BASE = 'http://localhost:4000/api';

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
  blackjackrooms: {
    list: () => request('/blackjackrooms'),
    create: (data: any) => request('/blackjackrooms', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(data) }),
    join: (id: string) => request(`/blackjackrooms/${id}/join`, { method: 'POST', headers: { ...authHeader() } }),
    get: (id: string) => request(`/blackjackrooms/${id}`),
    leave: (id: string) => request(`/blackjackrooms/${id}/leave`, { method: 'POST', headers: { ...authHeader() } }),
    ready: (id: string, data?: any) => request(`/blackjackrooms/${id}/ready`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(data || {}) }),
    unready: (id: string) => request(`/blackjackrooms/${id}/unready`, { method: 'POST', headers: { ...authHeader() } })
    ,
    action: (id: string, data: any) => request(`/blackjackrooms/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(data || {}) })
  },
  bacayrooms: {
    list: () => request('/bacayrooms'),
    create: (data: any) => request('/bacayrooms', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(data) }),
    join: (id: string) => request(`/bacayrooms/${id}/join`, { method: 'POST', headers: { ...authHeader() } })
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

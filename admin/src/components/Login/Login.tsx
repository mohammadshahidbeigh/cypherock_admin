import React, { useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { db, checkAuth } from '../../firebase';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Write login request to Firestore
      const docRef = await addDoc(collection(db, 'login_requests'), { email, password });
      // Listen for response in login_responses
      const unsub = onSnapshot(doc(db, 'login_responses', docRef.id), async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.token) {
            // Store JWT in localStorage
            localStorage.setItem('jwt_token', data.token);
            // Check token validity
            const authRes = await checkAuth(data.token);
            if (authRes.valid) {
              onLogin(data.token);
            } else {
              setError('Authentication failed');
              localStorage.removeItem('jwt_token');
            }
          } else {
            setError(data.message || 'Invalid credentials');
          }
          setLoading(false);
          unsub();
        }
      }, () => {
        setError('Login failed');
        setLoading(false);
      });
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  // Example: Use the token for authenticated requests
  // const token = localStorage.getItem('jwt_token');
  // fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } })

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        {error && <div className="error">{error}</div>}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span>Don't have an account? </span>
          <Link to="/signup" style={{ color: '#003cff', textDecoration: 'underline' }}>Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 
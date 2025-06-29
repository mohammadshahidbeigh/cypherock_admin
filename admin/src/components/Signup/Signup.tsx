import React, { useState } from 'react';
import '../Login/Login.css';
import { Link } from 'react-router-dom';
import { db, checkAuth } from '../../firebase';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';

interface SignupProps {
  onSignup: (token: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Write signup request to Firestore
      const docRef = await addDoc(collection(db, 'signup_requests'), { email, password, confirmPassword });
      // Listen for response in signup_responses
      const unsub = onSnapshot(doc(db, 'signup_responses', docRef.id), async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.token) {
            // Store JWT in localStorage
            localStorage.setItem('jwt_token', data.token);
            // Check token validity
            const authRes = await checkAuth(data.token);
            if (authRes.valid) {
              onSignup(data.token);
            } else {
              setError('Authentication failed');
              localStorage.removeItem('jwt_token');
            }
          } else {
            setError(data.message || 'Signup failed');
          }
          setLoading(false);
          unsub();
        }
      }, () => {
        setError('Signup failed');
        setLoading(false);
      });
    } catch (err) {
      setError('Signup failed');
      setLoading(false);
    }
  };

  // Example: Use the token for authenticated requests
  // const token = localStorage.getItem('jwt_token');
  // fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } })

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Signup</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        {error && <div className="error">{error}</div>}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: '#003cff', textDecoration: 'underline' }}>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup; 
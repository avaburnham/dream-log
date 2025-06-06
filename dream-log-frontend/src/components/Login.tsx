import React, { useState } from 'react';

interface LoginProps {
  onLogin: (token: string, userId: number, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const endpoint = isRegistering
        ? `${baseUrl}/register`
        : `${baseUrl}/login`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      if (isRegistering) {
        // After registering, log in immediately, or prompt user to login.
        setIsRegistering(false);
        setPassword('');
        setError('Account created! Please log in.');
      } else {
        onLogin(data.token, data.userId, email);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-3">
        <input
          className="form-control mb-2"
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="username"
          required
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          value={password}
          autoComplete={isRegistering ? "new-password" : "current-password"}
          required
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100" type="submit">
          {isRegistering ? 'Create Account' : 'Login'}
        </button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="text-center">
        <button
          type="button"
          className="btn btn-link"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
        >
          {isRegistering
            ? 'Already have an account? Login'
            : 'Create Account'}
        </button>
      </div>
    </div>
  );
};

export default Login;

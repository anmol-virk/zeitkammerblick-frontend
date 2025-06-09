import React from 'react';

const LoginPage = () => {

  const handleLogin = async () => {
    window.location.href = 'https://zeitkammerblick.vercel.app/auth/google';
  };

  return (
    <div className="container py-4 text-center">
      <div className='position-absolute top-50 start-50 translate-middle'>
      <h1>Welcome to Zeitkammerblick</h1>
      <p>Organize, share, and cherish your Photos.</p>
      <button onClick={handleLogin} className="btn btn-primary">
        Login with Google
      </button>
      </div>
    </div>
  );
};

export default LoginPage;

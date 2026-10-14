import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = ({ theme, toggleTheme }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Forgot Password Modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetUsername, setResetUsername] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Invalid username or password');
            }
        } catch {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        if (!resetUsername) return;
        setResetLoading(true);
        setResetMessage('');
        
        try {
            const response = await api.post('auth/request-password-reset/', { username: resetUsername });
            setResetMessage(response.data.message || 'Request submitted! Admin will reset it soon.');
            setResetUsername('');
            setTimeout(() => {
                setShowForgotModal(false);
                setResetMessage('');
            }, 3000);
        } catch (err) {
            setResetMessage(err.response?.data?.error || 'Failed to submit request. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    const styles = {
        wrapper: {
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            backgroundImage: `
                radial-gradient(circle at 20% 20%, var(--gradient-1) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, var(--gradient-2) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, var(--gradient-3) 0%, transparent 60%)
            `,
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden',
        },
        bgOrb1: {
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
        },
        bgOrb2: {
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            bottom: '-80px',
            left: '-80px',
            pointerEvents: 'none',
        },
        card: {
            background: 'var(--bg-navbar)',
            border: '1px solid var(--border-glass-bright)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            width: '95%',
            maxWidth: '420px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 1,
            margin: '1rem',
        },
        logoArea: {
            textAlign: 'center',
            marginBottom: '2rem',
        },
        logoImg: {
            height: '65px',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.3))',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-main), var(--text-muted))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.3rem',
        },
        subtitle: {
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            margin: 0,
            letterSpacing: '0.05em',
            fontWeight: 600,
            textTransform: 'uppercase'
        },
        errorBox: {
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            padding: '0.7rem 1rem',
            borderRadius: '10px',
            fontSize: '0.88rem',
            marginBottom: '1.2rem',
            textAlign: 'center',
        },
        fieldGroup: {
            marginBottom: '1.3rem',
        },
        label: {
            display: 'block',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.5rem',
        },
        inputWrap: {
            position: 'relative',
        },
        input: {
            width: '100%',
            padding: '0.85rem 1rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            color: 'var(--text-main)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            boxSizing: 'border-box',
        },
        eyeBtn: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '1.15rem',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            transition: 'color 0.2s',
        },
        submitBtn: {
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: '1rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
            letterSpacing: '0.03em',
            textTransform: 'uppercase'
        },
        footer: {
            textAlign: 'center',
            marginTop: '2.5rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.6
        },
        forgotBtn: {
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '0',
            transition: 'color 0.2s',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modalContent: {
            background: 'var(--bg-main)',
            width: '90%',
            maxWidth: '400px',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-glass)',
            position: 'relative',
        },
        modalTitle: {
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--text-main)',
            textAlign: 'center',
        },
        modalDesc: {
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            lineHeight: '1.5',
        },
        resetMsg: {
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#8DC63F',
        }
    };

    return (
        <div style={styles.wrapper}>
            <div className="animate-orb-1" style={styles.bgOrb1} />
            <div className="animate-orb-2" style={styles.bgOrb2} />

            {/* Theme Toggle for Login */}
            {toggleTheme && (
                <button 
                    className="sidebar-theme-toggle" 
                    onClick={toggleTheme}
                    style={{ position: 'fixed', top: '2rem', right: '2rem', margin: 0, zIndex: 100, width: 'auto', padding: '0.5rem 1rem' }}
                    title="Toggle Theme"
                >
                    <span className="icon">
                        {theme === 'dark' ? '🌙' : '☀️'}
                    </span>
                </button>
            )}

            <div style={styles.card}>
                <div style={styles.logoArea}>
                    <div className="logo-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <svg id="rgu-logo" viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg" style={{ maxHeight: '110px', filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.3))' }}>
                            {/* Large RGU Symbol */}
                            <g className="rgu-symbol">
                                <text x="250" y="120" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="140" textAnchor="middle">
                                    <tspan className="rgu-letter r" fill="#92278F">R</tspan>
                                    <tspan className="rgu-letter g" fill="#009CDE">G</tspan>
                                    <tspan className="rgu-letter u" fill="#8DC63F">U</tspan>
                                </text>
                            </g>
                            
                            {/* Full Name Section */}
                            <g className="university-name">
                                <text x="250" y="180" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="38" textAnchor="middle">
                                    <tspan className="name-part rathinam" fill="#92278F">Rathinam</tspan>
                                    <tspan className="name-part global" fill="#009CDE" dx="15">Global</tspan>
                                </text>
                                
                                <text x="250" y="215" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="18" textAnchor="middle" fill="#777" className="name-part deemed">
                                    deemed to be
                                </text>
                                
                                <text x="250" y="260" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="42" textAnchor="middle" fill="#8DC63F" className="name-part university">
                                    UNIVERSITY
                                </text>
                            </g>
                            
                            {/* Three-color Underline */}
                            <g className="underline-group">
                                <line className="line-segment" x1="40" y1="275" x2="160" y2="275" stroke="#F58220" strokeWidth="6" />
                                <line className="line-segment" x1="160" y1="275" x2="340" y2="275" stroke="#009CDE" strokeWidth="6" />
                                <line className="line-segment" x1="340" y1="275" x2="460" y2="275" stroke="#8DC63F" strokeWidth="6" />
                            </g>
                        </svg>
                    </div>
                    <h2 style={styles.title}>Water Tracker</h2>
                    <p style={styles.subtitle}>Management Portal</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                    <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="username">Username</label>
                        <div style={styles.inputWrap}>
                            <input
                                type="text"
                                id="username"
                                style={styles.input}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                autoFocus
                                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="password">Password</label>
                        <div style={styles.inputWrap}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                style={{ ...styles.input, paddingRight: '3rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                            />
                            <button
                                type="button"
                                style={styles.eyeBtn}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
                                onMouseLeave={e => e.target.style.color = '#888'}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <button 
                                type="button" 
                                style={styles.forgotBtn}
                                onClick={() => setShowForgotModal(true)}
                                onMouseEnter={e => e.target.style.color = 'var(--text-main)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={styles.submitBtn}
                        disabled={loading}
                        onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(37, 99, 235, 0.4)'; }}}
                        onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.3)'; }}
                    >
                        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
                </form>

                <div style={styles.footer}>
                    © 2026 Water Tracker System
                </div>
            </div>

            {showForgotModal && (
                <div style={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>Reset Password</h3>
                        <p style={styles.modalDesc}>
                            Enter your username below. We will notify the administrator to reset your password.
                        </p>
                        <form onSubmit={handleForgotSubmit}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Username</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={resetUsername}
                                    onChange={(e) => setResetUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                    autoFocus
                                    onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{ ...styles.submitBtn, marginTop: '1rem' }}
                                disabled={resetLoading}
                            >
                                {resetLoading ? '⏳ Submitting...' : '📩 Request Reset'}
                            </button>
                            {resetMessage && (
                                <div style={styles.resetMsg}>
                                    {resetMessage}
                                </div>
                            )}
                            <button 
                                type="button"
                                style={{ 
                                    width: '100%', 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--text-muted)', 
                                    marginTop: '1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => setShowForgotModal(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;

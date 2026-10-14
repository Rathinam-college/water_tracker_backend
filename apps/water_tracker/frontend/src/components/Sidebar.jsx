import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ theme, toggleTheme }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    
    const [openGroup, setOpenGroup] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!isCollapsed) {
            const path = location.pathname;
            if (path.includes('/reports')) {
                setOpenGroup('reports');
            } else if (path.includes('/entries') || path.includes('/yield-entries') || path.includes('/consumption-entries') || path.includes('/procurement')) {
                setOpenGroup('operations');
            } else if (['/locations', '/sources', '/vehicles', '/rates', '/student-counts', '/budget-tracking'].includes(path)) {
                setOpenGroup('master-data');
            }
        } else {
            setOpenGroup(null);
        }
        
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
        
        return () => {
            document.body.classList.remove('sidebar-collapsed');
        }
    }, [location.pathname, isCollapsed]);

    const handleToggleGroup = (groupName) => {
        if (isCollapsed) return;
        setOpenGroup(prev => prev === groupName ? null : groupName);
    };

    const isActive = (path) => {
        const current = location.pathname;
        const search = location.search;
        
        // Handle precise query param matches for reports
        if (path.includes('?')) {
            return current + search === path ? 'nav-link active' : 'nav-link';
        }
        return current === path ? 'nav-link active' : 'nav-link';
    };

    if (!user) return null;

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <>
            <button className={`mobile-sidebar-toggle ${mobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
                <span className="icon">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>

            {mobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu}></div>}

            <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <img 
                        src={logo} 
                        alt="Logo" 
                        className="sidebar-logo" 
                        onClick={() => isCollapsed && setIsCollapsed(false)}
                        style={{ cursor: isCollapsed ? 'pointer' : 'default', transition: 'all 0.3s' }}
                    />
                    {!isCollapsed && (
                        <div className="sidebar-brand">
                            <div className="brand-main">Water Tracker</div>
                            <div className="brand-sub">Management</div>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button className="desktop-toggle-btn" onClick={() => setIsCollapsed(true)} title="Collapse Sidebar">
                            <span className="icon">☰</span>
                        </button>
                    )}
                </div>

                <div className="sidebar-scrollable">
                    <ul className="sidebar-menu">
                        {!isCollapsed && <li className="menu-heading">Main Navigation</li>}
                        
                        <li>
                            <Link to="/" onClick={closeMobileMenu} className={location.pathname === '/' ? 'nav-link active' : 'nav-link'} title="Dashboard">
                                <span className="icon">📊</span> <span className="nav-text">Dashboard</span>
                            </Link>
                        </li>

                        {user?.can_access_operations && (
                            <li className="menu-group">
                                <div className={`nav-link group-header ${openGroup === 'operations' ? 'open' : ''}`} onClick={() => handleToggleGroup('operations')} title="Operations">
                                    <span><span className="icon">⚙️</span> <span className="nav-text">Operations</span></span> <span className="chevron">{openGroup === 'operations' ? '▾' : '▸'}</span>
                                </div>
                                <div className={`group-items ${openGroup === 'operations' ? 'expanded' : ''}`}>
                                    <Link to="/entries" className={isActive('/entries')} onClick={closeMobileMenu}>Water Purchase Entry</Link>
                                    <Link to="/yield-entries" className={isActive('/yield-entries')} onClick={closeMobileMenu}>Yield Tracking</Link>
                                    <Link to="/consumption-entries" className={isActive('/consumption-entries')} onClick={closeMobileMenu}>Consumption Tracking</Link>
                                    <Link to="/procurement" className={isActive('/procurement')} onClick={closeMobileMenu}>Procurement Tracker</Link>
                                </div>
                            </li>
                        )}

                        {user?.can_access_master_data && (
                            <li className="menu-group">
                                <div className={`nav-link group-header ${openGroup === 'master-data' ? 'open' : ''}`} onClick={() => handleToggleGroup('master-data')} title="Master Data">
                                    <span><span className="icon">🗃️</span> <span className="nav-text">Master Data</span></span> <span className="chevron">{openGroup === 'master-data' ? '▾' : '▸'}</span>
                                </div>
                                <div className={`group-items ${openGroup === 'master-data' ? 'expanded' : ''}`}>
                                    <Link to="/locations" className={isActive('/locations')} onClick={closeMobileMenu}>Locations</Link>
                                    <Link to="/sources" className={isActive('/sources')} onClick={closeMobileMenu}>Sources</Link>
                                    <Link to="/vehicles" className={isActive('/vehicles')} onClick={closeMobileMenu}>Registered Vehicles</Link>
                                    <Link to="/rates" className={isActive('/rates')} onClick={closeMobileMenu}>Rates</Link>
                                    <Link to="/student-counts" className={isActive('/student-counts')} onClick={closeMobileMenu}>Student Counts</Link>
                                    <Link to="/budget-tracking" className={isActive('/budget-tracking')} onClick={closeMobileMenu}>Budgets</Link>
                                </div>
                            </li>
                        )}

                        {user?.can_access_reports && (
                            <li className="menu-group">
                                <div className={`nav-link group-header ${openGroup === 'reports' ? 'open' : ''}`} onClick={() => handleToggleGroup('reports')} title="Reports">
                                    <span><span className="icon">📈</span> <span className="nav-text">Reports</span></span> <span className="chevron">{openGroup === 'reports' ? '▾' : '▸'}</span>
                                </div>
                                <div className={`group-items ${openGroup === 'reports' ? 'expanded' : ''}`}>
                                    <Link to="/reports?tab=daily" className={isActive('/reports?tab=daily')} onClick={closeMobileMenu}>Daily Water Purchase</Link>
                                    <Link to="/reports?tab=daily-yield" className={isActive('/reports?tab=daily-yield')} onClick={closeMobileMenu}>Daily Yield Report</Link>
                                    <Link to="/reports?tab=daily-normal-consumption" className={isActive('/reports?tab=daily-normal-consumption')} onClick={closeMobileMenu}>Daily Normal Consumption</Link>
                                    <Link to="/reports?tab=daily-drinking-consumption" className={isActive('/reports?tab=daily-drinking-consumption')} onClick={closeMobileMenu}>Daily Drinking Consumption</Link>
                                    <Link to="/reports?tab=monthly" className={isActive('/reports?tab=monthly')} onClick={closeMobileMenu}>Monthly Water Purchase</Link>
                                    <Link to="/reports?tab=yearly" className={isActive('/reports?tab=yearly')} onClick={closeMobileMenu}>Yearly Water Purchase</Link>
                                    <Link to="/reports?tab=watertype" className={isActive('/reports?tab=watertype')} onClick={closeMobileMenu}>Water Type Purchase</Link>
                                    <Link to="/reports?tab=vendor" className={isActive('/reports?tab=vendor')} onClick={closeMobileMenu}>Vendor Usage</Link>
                                    <Link to="/reports?tab=vehicle" className={isActive('/reports?tab=vehicle')} onClick={closeMobileMenu}>Vehicle Util</Link>
                                    <Link to="/reports?tab=comparison" className={isActive('/reports?tab=comparison')} onClick={closeMobileMenu}>Cost Comparison</Link>
                                    <Link to="/reports?tab=site" className={isActive('/reports?tab=site')} onClick={closeMobileMenu}>Site Wise Purchase</Link>
                                    <Link to="/reports?tab=capacity" className={isActive('/reports?tab=capacity')} onClick={closeMobileMenu}>Capacity Util</Link>
                                    <Link to="/reports?tab=category-breakdown" className={isActive('/reports?tab=category-breakdown')} onClick={closeMobileMenu}>Category Monthly</Link>
                                    <Link to="/reports?tab=procurement" className={isActive('/reports?tab=procurement')} onClick={closeMobileMenu}>Procurement Report</Link>
                                    <Link to="/reports?tab=muthu-nagar" className={isActive('/reports?tab=muthu-nagar')} onClick={closeMobileMenu}>🏟️ Muthu Nagar</Link>
                                    <Link to="/reports?tab=bannari-building-wise" className={isActive('/reports?tab=bannari-building-wise')} onClick={closeMobileMenu}>🏢 Bannari</Link>
                                    <Link to="/reports?tab=varahi-building-wise" className={isActive('/reports?tab=varahi-building-wise')} onClick={closeMobileMenu}>🏢 Varahi</Link>
                                    <Link to="/reports?tab=varahi-rathinam-vehicle" className={isActive('/reports?tab=varahi-rathinam-vehicle')} onClick={closeMobileMenu}>🏢 Varahi (Rathinam)</Link>
                                    <Link to="/reports?tab=rates" className={isActive('/reports?tab=rates')} onClick={closeMobileMenu}>Rate Details</Link>
                                </div>
                            </li>
                        )}


                    </ul>
                </div>

                <div className="sidebar-footer">
                    <div className="theme-toggle-wrapper">
                        <button className="sidebar-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? (isCollapsed ? '🌙' : '🌙 Dark Mode') :
                             theme === 'ocean' ? (isCollapsed ? '🌊' : '🌊 Ocean Mode') :
                             theme === 'robin' ? (isCollapsed ? '🪺' : '🪺 Robin Mode') :
                             (isCollapsed ? '☀️' : '☀️ Light Mode')}
                        </button>
                    </div>

                    <div className="user-profile-widget">
                        <div className="user-info-main">
                            <div className="user-avatar">{(user?.username || 'U').charAt(0).toUpperCase()}</div>
                            {!isCollapsed && (
                                <div className="user-details">
                                    <span className="user-name">{user?.username || 'User'}</span>
                                    <span className="user-role">User</span>
                                </div>
                            )}
                        </div>
                        
                        {isCollapsed ? (
                            <div className="user-actions" style={{ flexDirection: 'column', width: '100%', gap: '0.5rem' }}>
                                {user?.can_manage_users && (
                                    <Link to="/admin/users" className="sidebar-action-btn" title="Admin Access">🛡️</Link>
                                )}
                                <button className="sidebar-action-btn logout" onClick={logout} title="Logout">🚪</button>
                            </div>
                        ) : (
                            <div className="user-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                {user?.can_manage_users && (
                                    <Link to="/admin/users" className="sidebar-action-btn" title="Admin Access">Admin</Link>
                                )}
                                <button className="sidebar-action-btn logout" onClick={logout} title="Logout" style={{flex: 1}}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;

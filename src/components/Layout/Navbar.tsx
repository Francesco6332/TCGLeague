import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  User, 
  LogOut, 
  Trophy,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/events', label: 'My Events', icon: Calendar },
    { path: '/deck-builder', label: 'Deck Builder', icon: Layers },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <nav 
        className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                aria-label="TCG League - Go to homepage"
              >
                <Trophy className="h-8 w-8 text-yellow-400" aria-hidden="true" />
                <span className="font-bold text-xl gradient-text">TCG League</span>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4" role="menubar">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link flex items-center space-x-1 ${
                  isActive(path) ? 'active' : ''
                }`}
                role="menuitem"
                aria-current={isActive(path) ? 'page' : undefined}
                aria-label={`Navigate to ${label}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-3 ml-4">
              <div className="text-sm text-white/80" aria-label="User information">
                <span className="font-medium">{userProfile?.username}</span>
                <span className="block text-xs text-white/60 capitalize">
                  {userProfile?.userType}
                </span>
              </div>
              
              <div 
                className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                aria-hidden="true"
              >
                <User className="h-4 w-4 text-white" />
              </div>
              
              <button
                onClick={handleLogout}
                className="nav-link p-2"
                aria-label="Log out of your account"
                title="Logout"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nav-link p-2"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/40 rounded-lg mt-2" role="menu">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link flex items-center space-x-2 w-full ${
                    isActive(path) ? 'active' : ''
                  }`}
                  role="menuitem"
                  aria-current={isActive(path) ? 'page' : undefined}
                  aria-label={`Navigate to ${label}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
              
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm text-white/80">
                    <span className="font-medium block">{userProfile?.username}</span>
                    <span className="text-xs text-white/60 capitalize">
                      {userProfile?.userType}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="nav-link flex items-center space-x-2 w-full mt-2"
                  role="menuitem"
                  aria-label="Log out of your account"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}

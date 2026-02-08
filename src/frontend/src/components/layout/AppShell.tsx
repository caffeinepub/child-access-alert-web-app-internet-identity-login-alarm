import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Bell, Shield, Info } from 'lucide-react';
import LoginButton from '../Auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsAlarmActive } from '../../hooks/queries/useAlarm';
import { useEffect } from 'react';

export default function AppShell() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: alarmActive } = useIsAlarmActive();

  useEffect(() => {
    if (alarmActive && currentPath !== '/alarm') {
      navigate({ to: '/alarm' });
    }
  }, [alarmActive, currentPath, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/alarm-bell-icon.dim_512x512.png"
                alt="Child Access Alert"
                className="w-10 h-10"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-xl font-bold text-foreground">Child Access Alert</h1>
                <p className="text-xs text-muted-foreground">Guardian Protection System</p>
              </div>
            </button>

            <nav className="flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate({ to: '/dashboard' })}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate({ to: '/limitations' })}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    Info
                  </button>
                </>
              )}
              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2026. Built with <span className="text-destructive">♥</span> using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </p>
            <button
              onClick={() => navigate({ to: '/limitations' })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limitations & Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

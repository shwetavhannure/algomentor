import TopNav, { PublicTopNav } from './TopNav';
import BottomNav from './BottomNav';
import Logo from './Logo';
import ThemeToggle from '../ThemeToggle';

// top bar for phones and tablets (the big TopNav only shows on laptops)
function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
      <Logo />
      <ThemeToggle />
    </header>
  );
}

export function AppShell({ children, publicNav = false }) {
  return (
    <div className="min-h-dvh">
      {publicNav ? (
        <PublicTopNav />
      ) : (
        <>
          <TopNav />
          <MobileTopBar />
        </>
      )}
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-4 lg:pb-8">{children}</main>
      {!publicNav && <BottomNav />}
    </div>
  );
}

export function WorkspaceShell({ children }) {
  // on laptops the workspace fills the screen exactly
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <TopNav />
      <MobileTopBar />
      <div className="min-h-0 flex-1 pb-20 lg:overflow-hidden lg:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}

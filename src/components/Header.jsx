import { MenuIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { app } from 'src/state/app';

function handleMenuClick() {
  app.sidebarOpen = !app.sidebarOpen;
}

export const Header = () => (
  <div className="fixed top-0 left-0 w-full h-[50px] border-b bg-accent">
    <div className="flex items-center h-full">
      <Button variant="ghost" className="px-2" onClick={handleMenuClick}>
        <MenuIcon width="32px" height="32px" />
      </Button>
      <div className="text-xl text-muted">SVG-CODE</div>
    </div>
  </div>
);

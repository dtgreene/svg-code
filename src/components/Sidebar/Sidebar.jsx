import { useSnapshot } from 'valtio';
import SimpleBar from 'simplebar-react';
import clsx from 'clsx';

import { app } from 'src/state/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/Tabs';
import { ImageTab } from './ImageTab';
import { GCodeTab } from './GCodeTab';
import { AppTab } from './AppTab';

function handleTabChange(value) {
  app.sidebarTab = value;
}

export const Sidebar = () => {
  const appSnap = useSnapshot(app);

  return (
    <SimpleBar
      className={clsx(
        'w-[420px] h-[calc(100%-50px)] fixed left-0 top-[50px] border-r bg-accent overflow-x-hidden z-10 transition-all',
        {
          'left-0': appSnap.sidebarOpen,
          'left-[-420px]': !appSnap.sidebarOpen,
        }
      )}
    >
      <Tabs
        className="w-full pt-8"
        onValueChange={handleTabChange}
        value={appSnap.sidebarTab}
      >
        <TabsList className="flex justify-evenly px-4">
          <TabsTrigger className="flex-1" value="image">
            Image
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="gcode">
            G-Code
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="app">
            App
          </TabsTrigger>
        </TabsList>
        <TabsContent value="image">
          <ImageTab />
        </TabsContent>
        <TabsContent value="gcode">
          <GCodeTab />
        </TabsContent>
        <TabsContent value="app">
          <AppTab />
        </TabsContent>
      </Tabs>
    </SimpleBar>
  );
};

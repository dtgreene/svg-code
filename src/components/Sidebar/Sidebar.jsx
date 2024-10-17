import { useSnapshot } from 'valtio';
import SimpleBar from 'simplebar-react';

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
    <SimpleBar className="w-[420px] h-full fixed left-0 top-0 border-r bg-accent overflow-x-hidden">
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

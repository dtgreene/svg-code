import { Fragment } from 'react';
import { useSnapshot } from 'valtio';

import { settings } from 'src/state/settings';
import { SidebarSection } from './SidebarSection';
import { Label } from 'ui/Label';
import { Switch } from 'ui/Switch';
import { Input } from 'ui/Input';

function handleDisplayToolOnChange(value) {
  settings.display.toolOn = value;
}

function handleDisplayToolOffChange(value) {
  settings.display.toolOff = value;
}

function handleDisplayMarginsChange(value) {
  settings.display.margins = value;
}

function handleDisplayPathBoundsChange(value) {
  settings.display.pathBounds = value;
}

function handleDisplayGridBoundsChange(value) {
  settings.display.gridBounds = value;
}

function handleStrokeWidthChange(event) {
  settings.display.strokeWidth = event.target.value;
}

function handleAutoRefreshChange(value) {
  settings.autoRefresh = value;
}

export const AppTab = () => {
  const settingSnap = useSnapshot(settings, { sync: true });

  return (
    <Fragment>
      <SidebarSection>
        <div>
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.autoRefresh}
              onCheckedChange={handleAutoRefreshChange}
            />
            <span>Auto Refresh</span>
          </Label>
        </div>
      </SidebarSection>
      <SidebarSection label="Preview">
        <div className="flex">
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.toolOn}
              onCheckedChange={handleDisplayToolOnChange}
            />
            <div className="w-4 h-4 rounded bg-zinc-200"></div>
            <span>Tool On</span>
          </Label>
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.toolOff}
              onCheckedChange={handleDisplayToolOffChange}
            />
            <div className="w-4 h-4 rounded bg-orange-300/75"></div>
            <span>Tool Off</span>
          </Label>
        </div>
        <div className="flex">
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.margins}
              onCheckedChange={handleDisplayMarginsChange}
            />
            <div className="w-4 h-4 rounded bg-zinc-200/50"></div>
            <span>Margins</span>
          </Label>
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.pathBounds}
              onCheckedChange={handleDisplayPathBoundsChange}
            />
            <div className="w-4 h-4 rounded bg-green-500/75"></div>
            <span>Path Bounds</span>
          </Label>
        </div>
        {settingSnap.grid.enabled && (
          <div className="flex">
            <Label className="flex items-center gap-2 w-1/2">
              <Switch
                checked={settingSnap.display.gridBounds}
                onCheckedChange={handleDisplayGridBoundsChange}
              />
              <div className="w-4 h-4 rounded bg-red-500/75"></div>
              <span>Grid Bounds</span>
            </Label>
          </div>
        )}
        <div>
          <Label className="block mb-2 text-muted">Stroke Width</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={settingSnap.display.strokeWidth}
            onChange={handleStrokeWidthChange}
          />
        </div>
      </SidebarSection>
    </Fragment>
  );
};

import { Fragment } from 'react';
import { useSnapshot } from 'valtio';

import { settings } from 'src/state/settings';
import { SidebarSection } from './SidebarSection';
import { Label } from 'ui/Label';
import { Switch } from 'ui/Switch';
import { Input } from 'ui/Input';
import { Button } from '../ui/Button';

function handleDisplayToolOnChange(value) {
  settings.display.toolOn = value;
}

function handleDisplayToolOffChange(value) {
  settings.display.toolOff = value;
}

function handleDisplayMarginsChange(value) {
  settings.display.margins = value;
}

function handleDisplayBoundingBoxChange(value) {
  settings.display.boundingBox = value;
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
            <span>Tool On</span>
          </Label>
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.toolOff}
              onCheckedChange={handleDisplayToolOffChange}
            />
            <span>Tool Off</span>
          </Label>
        </div>
        <div className="flex">
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.margins}
              onCheckedChange={handleDisplayMarginsChange}
            />
            <span>Margins</span>
          </Label>
          <Label className="flex items-center gap-2 w-1/2">
            <Switch
              checked={settingSnap.display.boundingBox}
              onCheckedChange={handleDisplayBoundingBoxChange}
            />
            <span>Bounding Box</span>
          </Label>
        </div>
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

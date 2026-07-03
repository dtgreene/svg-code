import { useSnapshot } from 'valtio';

import { settings } from 'src/state/settings';
import { Label } from 'ui/Label';
import { Input } from 'ui/Input';
import { TextArea } from 'ui/TextArea';
import { Switch } from 'ui/Switch';
import { SidebarSection } from './SidebarSection';

function handleFeedRateChange(event) {
  settings.gcode.feedRate = event.target.value;
}

function handleInvertXChange(value) {
  settings.gcode.invertX = value;
}

function handleInvertYChange(value) {
  settings.gcode.invertY = value;
}

function handleToolOnChange(event) {
  settings.gcode.toolOnSequence = event.target.value;
}

function handleToolOffChange(event) {
  settings.gcode.toolOffSequence = event.target.value;
}

function handleProgramBeginChange(event) {
  settings.gcode.programBeginSequence = event.target.value;
}

function handleProgramEndChange(event) {
  settings.gcode.programEndSequence = event.target.value;
}

const OriginRadio = ({ origin, value }) => (
  <input
    name="origin"
    type="radio"
    checked={origin === value}
    onChange={() => {
      settings.gcode.origin = value;
    }}
  />
);

export const GCodeTab = () => {
  const settingSnap = useSnapshot(settings, { sync: true });

  return (
    <SidebarSection>
      <div>
        <Label className="block mb-2 text-muted">Feedrate</Label>
        <Input
          type="number"
          min="0"
          value={settingSnap.gcode.feedRate}
          onChange={handleFeedRateChange}
        />
      </div>
      <div>
        <Label className="block mb-2 text-muted">Origin</Label>
        <div className="flex justify-between">
          <div className="flex justify-center w-48">
            <div className="h-32 flex flex-col justify-evenly">
              <OriginRadio origin={settingSnap.gcode.origin} value="top-left" />
              <div className="flex-1 border-r"></div>
              <OriginRadio
                origin={settingSnap.gcode.origin}
                value="bottom-left"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-3 border-b w-full"></div>
              <OriginRadio origin={settingSnap.gcode.origin} value="center" />
              <div className="h-3 border-t w-full"></div>
            </div>
            <div className="h-32 flex flex-col justify-evenly">
              <OriginRadio
                origin={settingSnap.gcode.origin}
                value="top-right"
              />
              <div className="flex-1 border-l"></div>
              <OriginRadio
                origin={settingSnap.gcode.origin}
                value="bottom-right"
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 w-32">
            <div>
              <Label className="block mb-2 text-muted">Invert X-Axis</Label>
              <Switch
                checked={settingSnap.gcode.invertX}
                onCheckedChange={handleInvertXChange}
              />
            </div>
            <div>
              <Label className="block mb-2 text-muted">Invert Y-Axis</Label>
              <Switch
                checked={settingSnap.gcode.invertY}
                onCheckedChange={handleInvertYChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Label className="block mb-2 text-muted">Tool On Sequence</Label>
        <TextArea
          value={settingSnap.gcode.toolOnSequence}
          onChange={handleToolOnChange}
        />
      </div>
      <div>
        <Label className="block mb-2 text-muted">Tool Off Sequence</Label>
        <TextArea
          value={settingSnap.gcode.toolOffSequence}
          onChange={handleToolOffChange}
        />
      </div>
      <div>
        <Label className="block mb-2 text-muted">Program Begin Sequence</Label>
        <TextArea
          value={settingSnap.gcode.programBeginSequence}
          onChange={handleProgramBeginChange}
        />
      </div>
      <div>
        <Label className="block mb-2 text-muted">Program End Sequence</Label>
        <TextArea
          value={settingSnap.gcode.programEndSequence}
          onChange={handleProgramEndChange}
        />
      </div>
    </SidebarSection>
  );
};

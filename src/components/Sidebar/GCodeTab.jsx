import { useSnapshot } from 'valtio';

import { settings } from 'src/state/settings';
import { Label } from 'ui/Label';
import { Input } from 'ui/Input';
import { TextArea } from 'ui/TextArea';
import { SidebarSection } from './SidebarSection';

function handleFeedRateChange(event) {
  settings.gcode.feedRate = event.target.value;
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

import { Fragment } from 'react';
import { useSnapshot } from 'valtio';
import { ArrowLeftRight } from 'lucide-react';

import { settings } from 'src/state/settings';
import { Label } from 'ui/Label';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/Select';
import { Switch } from 'ui/Switch';
import { Tabs, TabsList, TabsTrigger } from 'ui/Tabs';
import { SidebarSection } from './SidebarSection';

const sizeOptions = [
  { label: 'A3', value: '0', height: '297', width: '420' },
  { label: 'A4', value: '1', height: '210', width: '297' },
  { label: 'A5', value: '2', height: '148', width: '210' },
  { label: 'US Letter', value: '3', height: '215.9', width: '279.4' },
  { label: 'Custom', value: '4' },
];
const customSizeOption = sizeOptions[4];

function handleWidthChange(event) {
  settings.width = event.target.value;
  settings.preset = customSizeOption.value;
}

function handleHeightChange(event) {
  settings.height = event.target.value;
  settings.preset = customSizeOption.value;
}

function handleDimensionSwapClick() {
  const currentWidth = settings.width;

  settings.width = settings.height;
  settings.height = currentWidth;
  settings.preset = customSizeOption.value;
}

function handlePresetChange(value) {
  const option = sizeOptions.find((option) => option.value === value);

  if (option.value !== customSizeOption.value) {
    settings.width = option.width;
    settings.height = option.height;
  }
  settings.preset = option.value;
}

function handleMarginXChange(event) {
  settings.marginX = event.target.value;
}

function handleMarginYChange(event) {
  settings.marginY = event.target.value;
}

function handleAlignmentChange(value) {
  settings.alignment = value;
}

function handleRotationChange(event) {
  settings.rotation = event.target.value;
}

function handleDimensionModeChange(value) {
  settings.dimensionMode = value;
}

function handleGridChange(value) {
  settings.grid.enabled = value;
}

function handleGridHeightChange(event) {
  settings.grid.totalHeight = event.target.value;
}

function handleGridWidthChange(event) {
  settings.grid.totalWidth = event.target.value;
}

function handleIncludeCornersChange(value) {
  settings.grid.includeCorners = value;
}

function handleCornerLengthChange(event) {
  settings.grid.cornerLength = event.target.value;
}

function handleMergeChange(value) {
  settings.postProcessing.merge = value;
}

function handleMergeToleranceChange(event) {
  settings.postProcessing.mergeTolerance = event.target.value;
}

function handleFilterShortChange(value) {
  settings.postProcessing.filterShort = value;
}

function handleFilterLengthChange(event) {
  settings.postProcessing.filterShortLength = event.target.value;
}

function handleReorderChange(value) {
  settings.postProcessing.reorder = value;
}

function handleRandomizeChange(value) {
  settings.postProcessing.randomizeStart = value;
}

function handleRandomizeToleranceChange(event) {
  settings.postProcessing.randomizeStartTolerance = event.target.value;
}

export const ImageTab = () => {
  const settingSnap = useSnapshot(settings, { sync: true });

  return (
    <Fragment>
      <SidebarSection>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Width (mm)</Label>
            <Input
              type="number"
              min="0"
              value={settingSnap.width}
              onChange={handleWidthChange}
            />
          </div>
          <Button
            variant="ghost"
            className="h-auto p-1"
            onClick={handleDimensionSwapClick}
          >
            <ArrowLeftRight size="24px" />
          </Button>
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Height (mm)</Label>
            <Input
              type="number"
              min="0"
              value={settingSnap.height}
              onChange={handleHeightChange}
            />
          </div>
        </div>
        <div>
          <Label className="block mb-2 text-muted">Preset</Label>
          <Select value={settingSnap.preset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Margin X</Label>
            <Input
              type="number"
              min="0"
              value={settingSnap.marginX}
              onChange={handleMarginXChange}
            />
          </div>
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Margin Y</Label>
            <Input
              type="number"
              min="0"
              value={settingSnap.marginY}
              onChange={handleMarginYChange}
            />
          </div>
        </div>
        <div>
          <Label className="block mb-2 text-muted">Dimension Mode</Label>
          <Tabs
            className="w-full"
            onValueChange={handleDimensionModeChange}
            value={settingSnap.dimensionMode}
          >
            <TabsList className="flex gap-4 border rounded-md">
              <TabsTrigger className="flex-1" value="boundingbox">
                Bounding Box
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="viewbox">
                View Box
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div>
          <Label className="block mb-2 text-muted">Alignment</Label>
          <Tabs
            className="w-full"
            onValueChange={handleAlignmentChange}
            value={settingSnap.alignment}
          >
            <TabsList className="flex gap-4 border rounded-md">
              <TabsTrigger className="flex-1" value="start">
                Start
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="middle">
                Middle
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="end">
                End
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div>
          <Label className="block mb-2 text-muted">Rotation (deg)</Label>
          <Input
            type="number"
            step="90"
            min="0"
            max="360"
            value={settingSnap.rotation}
            onChange={handleRotationChange}
          />
        </div>
      </SidebarSection>
      <SidebarSection
        label={
          <div className="flex justify-between items-center">
            <span>Grid Mode</span>
            <Label className="flex items-center gap-2 text-muted">
              <span>Enabled</span>
              <Switch
                checked={settingSnap.grid.enabled}
                onCheckedChange={handleGridChange}
              />
            </Label>
          </div>
        }
      >
        {settingSnap.grid.enabled && (
          <Fragment>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="block mb-2 text-muted">Total Width</Label>
                <Input
                  type="number"
                  min="0"
                  value={settingSnap.grid.totalWidth}
                  onChange={handleGridWidthChange}
                />
              </div>
              <div className="flex-1">
                <Label className="block mb-2 text-muted">Total Height</Label>
                <Input
                  type="number"
                  min="0"
                  value={settingSnap.grid.totalHeight}
                  onChange={handleGridHeightChange}
                />
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <Label className="block mb-2 text-muted">Include Corners</Label>
                <Switch
                  checked={settingSnap.grid.includeCorners}
                  onCheckedChange={handleIncludeCornersChange}
                />
              </div>
              <div className="flex-1">
                <Label className="block mb-2 text-muted">Corner Length</Label>
                <Input
                  type="number"
                  min="0"
                  value={settingSnap.grid.cornerLength}
                  onChange={handleCornerLengthChange}
                />
              </div>
            </div>
          </Fragment>
        )}
      </SidebarSection>
      <SidebarSection label="Post Processing">
        <div className="flex justify-between">
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Merge Paths</Label>
            <Switch
              checked={settingSnap.postProcessing.merge}
              onCheckedChange={handleMergeChange}
            />
          </div>
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Tolerance</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={settingSnap.postProcessing.mergeTolerance}
              onChange={handleMergeToleranceChange}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Filter Short Paths</Label>
            <Switch
              checked={settingSnap.postProcessing.filterShort}
              onCheckedChange={handleFilterShortChange}
            />
          </div>
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Minimum Path Length</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={settingSnap.postProcessing.filterShortLength}
              onChange={handleFilterLengthChange}
            />
          </div>
        </div>
        <div className="flex-1">
          <Label className="block mb-2 text-muted">Reorder</Label>
          <Switch
            checked={settingSnap.postProcessing.reorder}
            onCheckedChange={handleReorderChange}
          />
        </div>
        <div className="flex justify-between">
          <div className="flex-1">
            <Label className="block mb-2 text-muted">
              Randomize Path Start
            </Label>
            <Switch
              checked={settingSnap.postProcessing.randomizeStart}
              onCheckedChange={handleRandomizeChange}
            />
          </div>
          <div className="flex-1">
            <Label className="block mb-2 text-muted">Tolerance</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={settingSnap.postProcessing.randomizeStartTolerance}
              onChange={handleRandomizeToleranceChange}
            />
          </div>
        </div>
      </SidebarSection>
    </Fragment>
  );
};

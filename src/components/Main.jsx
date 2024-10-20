import { useEffect, useState } from 'react';
import { subscribe, useSnapshot } from 'valtio';
import { useDropzone } from 'react-dropzone';
import {
  AlertCircle,
  DownloadIcon,
  FileImageIcon,
  RefreshCwIcon,
} from 'lucide-react';
import clsx from 'clsx';
import 'simplebar-react/dist/simplebar.min.css';
import { saveAs } from 'file-saver';
import { downloadZip } from 'client-zip';

import { app } from 'src/state/app';
import { settings } from 'src/state/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/Tabs';
import { Button } from 'ui/Button';
import { Alert, AlertDescription, AlertTitle } from 'ui/Alert';
import { debouncedWorkerStart } from 'src/lib/prep-worker/worker';
import { PreviewSVG, PreviewSVGRoot } from './PreviewSVG';
import { generateGCode } from 'src/lib/gcode';
import { StorageKeys } from 'src/state/storage';

// The maximum file size (in bytes) allowed for saving to local storage. Files
// larger than this can be used, we just won't save them to the local storage.
const maxFileSize = 4 * 1024 * 1024;

function handleFileDrop([file]) {
  const reader = new FileReader();
  reader.onload = () => {
    app.fileName = file.name;
    app.fileData = reader.result;

    const blob = new Blob([reader.result]);

    if (blob.size < maxFileSize) {
      localStorage.setItem(
        StorageKeys.FILE,
        JSON.stringify({ name: file.name, data: reader.result })
      );
    } else {
      localStorage.removeItem(StorageKeys.FILE);
    }

    debouncedWorkerStart();
  };
  reader.readAsText(file);
}

async function handleDownloadGCodeClick() {
  if (!app.workerData) return;

  const {
    feedRate,
    toolOnSequence,
    toolOffSequence,
    programBeginSequence,
    programEndSequence,
  } = settings.gcode;

  const gcodeOptions = {
    feedRate: Math.round(Number(feedRate) || 0),
    toolOnSequence,
    toolOffSequence,
    programBeginSequence,
    programEndSequence,
  };

  if (gcodeOptions.feedRate <= 0) {
    settings.inputError = 'Invalid feed rate';
    return;
  }
  const { pathGrid, options } = app.workerData;
  const plainFileName = app.fileName.replace('.svg', '');

  if (pathGrid.length === 1) {
    // Download the single gcode file
    const { pathList } = pathGrid[0];
    const gcode = generateGCode(pathList, options, gcodeOptions);
    const blob = new Blob([gcode], { type: 'text/plain' });

    saveAs(blob, `${plainFileName}.gcode`);
  } else {
    // Zip all of the gcode files together
    const blob = await downloadZip(
      pathGrid.map(({ pathList }, index) => {
        const suffix = index.toString().padStart(2, '0');

        return {
          name: `${plainFileName}_${suffix}.gcode`,
          input: generateGCode(pathList, options, gcodeOptions),
        };
      })
    ).blob();

    saveAs(blob, `${plainFileName}.zip`);
  }
}

function handleSettingsChange() {
  if (settings.autoRefresh) {
    debouncedWorkerStart();
  }
}

const ImagePlaceholder = () => (
  <div className="flex flex-col items-center justify-center text-muted h-[300px] bg-accent border rounded-md">
    <FileImageIcon width="120" height="120" />
    <div>Image will appear here</div>
  </div>
);

export const Main = () => {
  const appSnap = useSnapshot(app);
  const settingSnap = useSnapshot(settings);

  const [currentTab, setCurrentTab] = useState('preview');

  useEffect(() => {
    try {
      if (localStorage.getItem(StorageKeys.FILE)) {
        const json = JSON.parse(localStorage.getItem(StorageKeys.FILE));

        app.fileName = json.name;
        app.fileData = json.data;

        debouncedWorkerStart();
      }
    } catch {
      localStorage.removeItem(StorageKeys.FILE);
    }

    return subscribe(settings, handleSettingsChange);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'image/svg+xml': ['.svg'],
    },
    multiple: false,
  });

  const combinedErrors = [settingSnap.inputError, appSnap.workerError].filter(
    Boolean
  );

  const previews = appSnap.workerData?.previews;
  const dataOptions = appSnap.workerData?.options;
  const previewCols = dataOptions?.grid.enabled ? dataOptions?.grid.cols : 1;
  const previewStyle = {
    gridTemplateColumns: `repeat(${previewCols}, 1fr)`,
  };

  return (
    <div className="fixed left-[420px] top-0 w-[calc(100%-420px)] h-[calc(100%-75px)] overflow-y-auto">
      <div className="flex justify-center p-8">
        <div className="w-full max-w-[1000px]">
          <div
            {...getRootProps()}
            className="border-dashed border rounded-md bg-background px-12 py-8 cursor-pointer mb-8"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="mb-2">Drop the files here...</div>
            ) : (
              <div className="mb-2">
                Drag & drop files here, or click to select
              </div>
            )}
            <div className="text-muted">
              <span>Selected file:</span>
              <span className={clsx({ 'text-primary': !!appSnap.fileName })}>
                {' '}
                {appSnap.fileName || 'None'}
              </span>
            </div>
          </div>
          {combinedErrors.length > 0 && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle size="16px" />
              <AlertTitle>Oops</AlertTitle>
              <AlertDescription>
                {combinedErrors.map((error) => (
                  <div key={error}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}
          <Tabs
            className="w-full mb-8"
            onValueChange={setCurrentTab}
            value={currentTab}
          >
            <TabsList className="flex gap-4 mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="grid gap-4" style={previewStyle}>
                {previews?.map((preview) => (
                  <PreviewSVG
                    preview={preview}
                    width={dataOptions.width}
                    height={dataOptions.height}
                    key={preview.id}
                  />
                ))}
              </div>
              {!appSnap.workerData && <ImagePlaceholder />}
            </TabsContent>
            <TabsContent value="original">
              {appSnap.fileData ? (
                <PreviewSVGRoot
                  dangerouslySetInnerHTML={{ __html: appSnap.fileData }}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="fixed bottom-0 left-[420px] w-[calc(100%-420px)] h-[75px] p-4 bg-accent border-t">
        <div className="flex justify-end gap-4">
          {!settingSnap.autoRefresh && (
            <Button
              className="flex gap-2"
              variant="outline"
              disabled={!appSnap.fileData}
              onClick={debouncedWorkerStart}
            >
              <RefreshCwIcon />
              <span>Refresh</span>
            </Button>
          )}
          <Button
            className="flex gap-2"
            disabled={!appSnap.workerData}
            onClick={handleDownloadGCodeClick}
          >
            <DownloadIcon />
            <span>Download G-Code</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

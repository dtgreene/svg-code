import { useSnapshot } from 'valtio';

import { settings } from 'src/state/settings';

const dashStyle = { strokeDasharray: '4 4' };

export const PreviewSVGRoot = ({ children, ...props }) => (
  <div className="flex justify-center svg-preview" {...props}>
    {children}
  </div>
);

export const PreviewSVG = ({ preview, width, height }) => {
  const settingSnap = useSnapshot(settings);

  const { display } = settingSnap;
  const paperViewBox = `0 0 ${width || 0} ${height || 0}`;

  return (
    <PreviewSVGRoot>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={paperViewBox}
        className="bg-accent fill-none"
        strokeLinecap="round"
        strokeWidth={Number(display.strokeWidth) || 0}
      >
        {display.toolOff && (
          <path
            d={preview.upPath}
            className="stroke-pink-300 dark:stroke-pink-500"
          />
        )}
        {display.toolOn && (
          <path
            d={preview.downPath}
            className="stroke-black dark:stroke-zinc-200"
          />
        )}
        {display.margins && (
          <path
            d={preview.marginsPath}
            className="stroke-black dark:stroke-zinc-200"
            style={dashStyle}
          />
        )}
        {display.boundingBox && (
          <path
            d={preview.boundsPath}
            className="stroke-green-600 dark:stroke-green-500"
          />
        )}
      </svg>
    </PreviewSVGRoot>
  );
};

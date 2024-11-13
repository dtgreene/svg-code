import { useSnapshot } from 'valtio';

import { settings } from 'src/state/settings';

const dashStyle = { strokeDasharray: '5 8' };

export const PreviewSVGRoot = ({ children, ...props }) => (
  <div className="flex justify-center svg-preview" {...props}>
    {children}
  </div>
);

export const PreviewSVG = ({ preview, width, height }) => {
  const settingSnap = useSnapshot(settings);

  const { display } = settingSnap;
  const paperViewBox = `0 0 ${width || 0} ${height || 0}`;
  const midX = (Number(width) || 0) * 0.5;
  const midY = (Number(height) || 0) * 0.5;

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
          <path d={preview.upPath} className="stroke-orange-300/75" />
        )}
        {display.toolOn &&
          (preview.downPath ? (
            <path d={preview.downPath} className="stroke-zinc-200" />
          ) : (
            <text
              x={midX}
              y={midY}
              className="fill-muted font-mono text-4xl"
              textAnchor="middle"
            >
              (empty)
            </text>
          ))}
        {display.margins && (
          <path
            d={preview.marginsPath}
            className="stroke-zinc-200/50"
            style={dashStyle}
          />
        )}
        {display.pathBounds && (
          <path d={preview.pathBoundsPath} className="stroke-green-500/75" />
        )}
        {display.gridBounds && settingSnap.grid.enabled && (
          <path d={preview.gridBoundsPath} className="stroke-red-500" />
        )}
      </svg>
    </PreviewSVGRoot>
  );
};

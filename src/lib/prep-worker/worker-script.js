import { prepareSVG } from '../svg/prepare';
import { createPreview } from '../svg/preview';

onmessage = (event) => {
  try {
    const { svg, options } = JSON.parse(event.data);
    const rows = prepareSVG(svg, options);

    postMessage(
      JSON.stringify({
        isError: false,
        result: {
          rows,
          previews: rows.map(({ pathList, bounds }) =>
            createPreview(pathList, bounds, options)
          ),
          options,
        },
      })
    );
  } catch (error) {
    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error(error);
    postMessage(JSON.stringify({ isError: true, errorMessage }));
  }
};
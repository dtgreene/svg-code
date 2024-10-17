import { Button } from 'ui/Button';

export const ErrorFallback = ({ error }) => {
  let errorMessage = 'Unknown error';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="p-16 flex justify-center">
      <div className="border bg-accent rounded-md p-8 max-w-[600px]">
        <div className="mb-4 text-4xl">Oops</div>
        <div className="mb-8">
          <div>Something went wrong...</div>
          <div>{errorMessage}</div>
        </div>
        <div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Reset Saved State
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

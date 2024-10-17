import 'simplebar-react/dist/simplebar.min.css';
import { ErrorBoundary } from 'react-error-boundary';

import { Sidebar } from './Sidebar/Sidebar';
import { ErrorFallback } from './ErrorFallback';
import { Main } from './Main';

export const App = () => (
  <div className="h-screen">
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Sidebar />
      <Main />
    </ErrorBoundary>
  </div>
);

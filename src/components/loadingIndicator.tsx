import { SyncLoader } from "react-spinners";

export default function LoadingIndicator(
    {title = "Loading Project...", message = "Getting your tasks ready"}: {
        title?: string;
        message?: string;
    }
) {
  return (
      <div className="flex flex-col items-center justify-center w-full h-screen gap-5 bg-gray-50">
        <div className="animate-pulse">
          <SyncLoader
              color="#4f46e5"
              size={20}
              margin={5}
              aria-label="Loading Spinner"
              data-testid="loader"
          />
        </div>
        <h1 className="text-xl font-medium text-gray-700 animate-pulse">{title}</h1>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
  );
}
interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white md:rounded-lg shadow-xl p-8 text-center">
          <div className="text-gray-600">{message}</div>
        </div>
      </div>
    </div>
  );
}

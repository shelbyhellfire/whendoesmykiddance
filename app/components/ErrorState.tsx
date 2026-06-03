interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-red-600">{message}</div>
        </div>
      </div>
    </div>
  );
}

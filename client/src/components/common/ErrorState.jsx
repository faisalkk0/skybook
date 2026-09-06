export default function ErrorState({ message, onRetry }) {
  return (
    <div className="card border-red-100 px-6 py-10 text-center">
      <p className="font-semibold text-red-700">{message || 'Unable to load this page.'}</p>
      {onRetry ? (
        <button type="button" className="btn-outline mt-4" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

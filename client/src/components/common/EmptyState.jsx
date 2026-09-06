export default function EmptyState({ title, description, action }) {
  return (
    <div className="card px-6 py-14 text-center">
      <h3 className="text-lg font-semibold text-navy-800">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

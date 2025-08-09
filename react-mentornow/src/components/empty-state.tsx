import { ComponentType } from 'react'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="border rounded-xl p-8 text-center space-y-3">
      <Icon className="h-5 w-5 mx-auto text-muted-foreground" />
      <h3 className="text-sm font-medium">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

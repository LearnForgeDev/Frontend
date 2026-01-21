import type {PluginItem} from "../../../../types/lessonTypes.ts";

export default function DefaultButton({
  button,
  action,
  active = false,
  disabled = false
}: {
  button: PluginItem,
  action: (event: string) => void,
  active?: boolean,
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => action(button.event)}
      aria-label={button.label}
      className={`toolbar-button ${active ? 'active' : ''}`}
      disabled={disabled}
    >
      <img src={button.icon} alt={button.label} />
    </button>
  )
}
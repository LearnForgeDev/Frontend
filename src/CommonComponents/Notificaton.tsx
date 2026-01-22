export default function Notificaton({title, message, success}: {title?: string, message?: string, success?: boolean}) {
  const notificationTitle =
    title === undefined
      ? success !== undefined
        ? (success ? 'Успешно' : 'Ошибка')
        : 'Уведомление'
      : title

  return (
    <div className={`notification ${success !== undefined ? (success ? 'success' : 'error') : ''}`}>
      <p>{notificationTitle}</p>
      <p>{message ?? ''}</p>
    </div>
  )
}
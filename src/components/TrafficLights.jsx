import { useEffect, useState } from 'react'

export default function TrafficLights() {
  const [hovered, setHovered] = useState(false)
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    async function checkMaximized() {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      setMaximized(await getCurrentWindow().isMaximized())
    }
    checkMaximized()
  }, [])

  async function handleClose() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    getCurrentWindow().close()
  }

  async function handleMinimize() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    getCurrentWindow().minimize()
  }

  async function handleMaximize() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    const win = getCurrentWindow()
    if (await win.isMaximized()) {
      await win.unmaximize()
      setMaximized(false)
    } else {
      await win.maximize()
      setMaximized(true)
    }
  }

  return (
    <div
      className="flex items-center gap-1.5 mr-3"
      style={{ WebkitAppRegion: 'no-drag' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Close — red */}
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full flex items-center justify-center"
        style={{ background: '#ff5f57', flexShrink: 0 }}
        title="Close"
      >
        {hovered && (
          <svg width="6" height="6" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="#7a0600" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Minimize — yellow */}
      <button
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full flex items-center justify-center"
        style={{ background: '#febc2e', flexShrink: 0 }}
        title="Minimize"
      >
        {hovered && (
          <svg width="6" height="2" viewBox="0 0 8 2" fill="none">
            <path d="M1 1h6" stroke="#7a5200" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Maximize — green */}
      <button
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full flex items-center justify-center"
        style={{ background: '#28c840', flexShrink: 0 }}
        title={maximized ? 'Restore' : 'Maximize'}
      >
        {hovered && (
          <svg width="6" height="6" viewBox="0 0 10 10" fill="none">
            <path d="M1 5h8M5 1v8" stroke="#006500" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  )
}

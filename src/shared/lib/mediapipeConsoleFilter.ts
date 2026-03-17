export function installMediapipeConsoleFilter() {
  if (typeof window === 'undefined') return

  const originalLog = console.log.bind(console)
  const originalInfo = console.info.bind(console)
  const originalWarn = console.warn.bind(console)
  const originalError = console.error.bind(console)

  const shouldSuppress = (args: any[]) => {
    const msg = args.map(String).join(' ')
    return (
      msg.includes('Created TensorFlow Lite XNNPACK delegate for CPU') ||
      msg.includes('Using NORM_RECT without IMAGE_DIMENSIONS') ||
      msg.includes('FaceBlendshapesGraph acceleration to xnnpack') ||
      msg.includes('OpenGL error checking is disabled') ||
      msg.includes('Graph successfully started running') ||
      msg.includes('vision_wasm_internal.js')
    )
  }

  console.log = (...args) => {
    if (shouldSuppress(args)) return
    originalLog(...args)
  }

  console.info = (...args) => {
    if (shouldSuppress(args)) return
    originalInfo(...args)
  }

  console.warn = (...args) => {
    if (shouldSuppress(args)) return
    originalWarn(...args)
  }

  console.error = (...args) => {
    if (shouldSuppress(args)) return
    originalError(...args)
  }
}

<script setup lang="ts">
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const reducedMotion = usePreferredReducedMotion()
const visible = useElementVisibility(canvas)
const { width, height } = useElementSize(canvas)

const LINES = 26
const STEP = 12

let frame = 0
let time = 0

function draw(ctx: CanvasRenderingContext2D, color: string) {
  const w = width.value
  const h = height.value
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  for (let i = 0; i < LINES; i++) {
    const base = (h / LINES) * (i + 0.5)
    ctx.globalAlpha = 0.05 + (i / LINES) * 0.1
    ctx.beginPath()
    for (let x = 0; x <= w + STEP; x += STEP) {
      const wave = Math.sin(x * 0.004 + time + i * 0.35) * 18
        + Math.sin(x * 0.011 - time * 1.3 + i * 0.6) * 8
        + Math.cos(x * 0.0017 + i * 0.2 + time * 0.5) * 26
      const y = base + wave
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

function setup() {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  el.width = width.value * dpr
  el.height = height.value * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const color = getComputedStyle(el).color
  cancelAnimationFrame(frame)

  if (reducedMotion.value === 'reduce') {
    draw(ctx, color)
    return
  }

  const loop = () => {
    if (visible.value) {
      time += 0.004
      draw(ctx, color)
    }
    frame = requestAnimationFrame(loop)
  }
  loop()
}

const colorMode = useColorMode()
watch([width, height, reducedMotion, () => colorMode.value], setup, { flush: 'post' })
onMounted(setup)
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <canvas ref="canvas" class="size-full text-primary pointer-events-none" aria-hidden="true" />
</template>

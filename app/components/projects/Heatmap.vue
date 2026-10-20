<script setup lang="ts">
import type { Contributions } from '~~/server/api/github/contributions.get'

defineProps<{ data: Contributions }>()

const CELL = 11
const GAP = 3
const OPACITY = [0.08, 0.3, 0.5, 0.75, 1]
</script>

<template>
  <figure>
    <div class="overflow-x-auto">
      <svg
        :width="data.weeks.length * (CELL + GAP)"
        :height="7 * (CELL + GAP)"
        class="text-primary"
        role="img"
        :aria-label="`过去一年共 ${data.total} 次贡献`"
      >
        <g v-for="(week, x) in data.weeks" :key="x">
          <rect
            v-for="(day, y) in week"
            :key="day.date"
            :x="x * (CELL + GAP)"
            :y="y * (CELL + GAP)"
            :width="CELL"
            :height="CELL"
            rx="2"
            fill="currentColor"
            :fill-opacity="OPACITY[day.level]"
          >
            <title>{{ day.date }}：{{ day.count }} 次贡献</title>
          </rect>
        </g>
      </svg>
    </div>
    <figcaption class="mt-3 kicker">
      过去一年 {{ data.total }} 次贡献
    </figcaption>
  </figure>
</template>

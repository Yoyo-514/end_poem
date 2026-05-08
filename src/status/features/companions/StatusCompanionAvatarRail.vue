<script setup lang="ts">
import type { StatusCompanionId, StatusCompanionProfile } from './companion-presenters';

interface Props {
  profiles: StatusCompanionProfile[];
  activeId: StatusCompanionId | null;
}

interface Emits {
  select: [id: StatusCompanionId];
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div class="companion-avatar-rail" aria-label="同伴头像入口">
    <button
      v-for="profile in profiles"
      :key="profile.id"
      class="companion-avatar-rail__item"
      :class="[
        `companion-avatar-rail__item--${profile.theme}`,
        {
          'companion-avatar-rail__item--active': activeId === profile.id,
          'companion-avatar-rail__item--locked': profile.locked,
          'companion-avatar-rail__item--mystery': profile.mystery,
        },
      ]"
      type="button"
      :aria-pressed="activeId === profile.id"
      @click="$emit('select', profile.id)"
    >
      <span class="companion-avatar-rail__portrait-wrap">
        <img
          v-if="profile.avatar && !profile.mystery"
          class="companion-avatar-rail__portrait"
          :class="{ 'companion-avatar-rail__portrait--locked': profile.locked }"
          :src="profile.avatar"
          :alt="profile.locked ? '未知同伴' : profile.name"
        />
        <span v-else class="companion-avatar-rail__placeholder">?</span>
      </span>
      <span class="companion-avatar-rail__name">{{ profile.locked ? '???' : profile.name }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.companion-avatar-rail {
  @apply flex min-w-0 shrink-0 gap-2 overflow-x-auto pb-1 pt-1;
  scrollbar-width: thin;
  scrollbar-color: var(--status-theme-soft) transparent;
}

.companion-avatar-rail__item {
  --companion-accent: var(--status-theme);
  --companion-soft: var(--status-theme-soft);

  @apply flex w-[3.5rem] shrink-0 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 text-[10px] transition duration-150;
  color: var(--status-theme-muted);
}

.companion-avatar-rail__item--mio {
  --companion-accent: #a78bfa;
  --companion-soft: rgba(167, 139, 250, 0.28);
}

.companion-avatar-rail__item--shiro {
  --companion-accent: #dbeafe;
  --companion-soft: rgba(219, 234, 254, 0.32);
}

.companion-avatar-rail__item--kohina {
  --companion-accent: #f87171;
  --companion-soft: rgba(248, 113, 113, 0.24);
}

.companion-avatar-rail__item--midori {
  --companion-accent: #f9a8d4;
  --companion-soft: rgba(249, 168, 212, 0.24);
}

.companion-avatar-rail__item--lily {
  --companion-accent: #111827;
  --companion-soft: rgba(17, 24, 39, 0.32);
}

.companion-avatar-rail__item:hover,
.companion-avatar-rail__item--active {
  color: var(--status-theme-text);
}

.companion-avatar-rail__item:hover .companion-avatar-rail__portrait-wrap,
.companion-avatar-rail__item--active .companion-avatar-rail__portrait-wrap {
  box-shadow: 0 0 0 2px var(--companion-accent);
}

.companion-avatar-rail__item--locked {
  color: color-mix(in srgb, var(--status-theme-muted) 72%, black);
}

.companion-avatar-rail__portrait-wrap {
  @apply relative flex size-12 items-center justify-center overflow-hidden rounded-full;
  background-color: transparent;
}

.companion-avatar-rail__portrait {
  @apply h-full w-full object-cover;
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--companion-accent) 36%, transparent));
}

.companion-avatar-rail__portrait--locked {
  filter: brightness(0) saturate(0);
  opacity: 0.9;
}

.companion-avatar-rail__placeholder {
  @apply flex size-full items-center justify-center rounded-full text-lg font-semibold;
  color: #e5e7eb;
  background-color: rgba(0, 0, 0, 0.86);
}

.companion-avatar-rail__item--mystery .companion-avatar-rail__placeholder {
  color: #e5e7eb;
}

.companion-avatar-rail__name {
  @apply max-w-full truncate;
}
</style>

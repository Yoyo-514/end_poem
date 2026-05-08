<script setup lang="ts">
import type { StatusEncounterProfile } from './encounter-presenters';

interface Props {
  profile: StatusEncounterProfile;
  expanded: boolean;
}

interface Emits {
  toggle: [id: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toggleCard = () => {
  emit('toggle', props.profile.id);
};
</script>

<template>
  <article class="status-encounter-card" :class="{ 'status-encounter-card--expanded': expanded }">
    <button
      class="status-encounter-card__header"
      :class="{ 'status-encounter-card__header--with-avatar': profile.avatar }"
      type="button"
      :aria-expanded="expanded"
      @click="toggleCard"
    >
      <span v-if="profile.avatar" class="status-encounter-card__avatar">
        <img :src="profile.avatar" :alt="profile.name" />
      </span>
      <span class="status-encounter-card__headline">
        <span class="status-encounter-card__name">{{ profile.name }}</span>
        <span class="status-encounter-card__identity">{{ profile.identity }}</span>
      </span>
      <span class="status-encounter-card__trust">信任 {{ profile.trustLevel }}</span>
      <i class="status-encounter-card__chevron fas fa-chevron-down" aria-hidden="true"></i>
    </button>

    <Transition name="status-encounter-card-expand">
      <div v-if="expanded" class="status-encounter-card__body">
        <img
          v-if="profile.portrait"
          class="status-encounter-card__portrait"
          :src="profile.portrait"
          :alt="profile.name"
        />

        <section v-if="profile.appearance" class="status-encounter-card__section">
          <h4 class="status-encounter-card__section-title">外观</h4>
          <p class="status-encounter-card__text">{{ profile.appearance }}</p>
        </section>

        <section v-if="profile.posture" class="status-encounter-card__section">
          <h4 class="status-encounter-card__section-title">姿态动作</h4>
          <p class="status-encounter-card__text">{{ profile.posture }}</p>
        </section>

        <section v-if="profile.items.length > 0" class="status-encounter-card__section">
          <h4 class="status-encounter-card__section-title">持有物品</h4>
          <div class="status-encounter-card__entry-list">
            <div v-for="item in profile.items" :key="item.label" class="status-encounter-card__entry">
              <span class="status-encounter-card__entry-head">
                <span class="status-encounter-card__entry-name">{{ item.label }}</span>
                <span v-if="item.quantity" class="status-encounter-card__entry-quantity">×{{ item.quantity }}</span>
              </span>
              <span v-if="item.description" class="status-encounter-card__entry-desc">{{ item.description }}</span>
              <span class="status-encounter-card__entry-meta">{{ item.value }}</span>
            </div>
          </div>
        </section>

        <section v-if="profile.abilities.length > 0" class="status-encounter-card__section">
          <h4 class="status-encounter-card__section-title">能力</h4>
          <div class="status-encounter-card__entry-list">
            <div v-for="ability in profile.abilities" :key="ability.label" class="status-encounter-card__entry">
              <span class="status-encounter-card__entry-name">{{ ability.label }}</span>
              <span class="status-encounter-card__entry-desc">{{ ability.value }}</span>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </article>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-encounter-card {
  @apply min-w-0 shrink-0 overflow-hidden rounded-lg border;
  border-color: color-mix(in srgb, var(--status-theme) 20%, transparent);
  background-color: color-mix(in srgb, var(--status-theme-soft) 34%, transparent);
}

.status-encounter-card--expanded {
  border-color: color-mix(in srgb, var(--status-theme) 48%, transparent);
}

.status-encounter-card__header {
  @apply grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-0 bg-transparent px-2.5 py-2 text-left;
  color: var(--status-theme-text);
}

.status-encounter-card__header--with-avatar {
  @apply grid-cols-[2.5rem_minmax(0,1fr)_auto_auto];
}

.status-encounter-card__avatar {
  @apply flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full;

  img {
    @apply size-full object-cover;
  }
}

.status-encounter-card__headline {
  @apply grid min-w-0 gap-0.5;
}

.status-encounter-card__name {
  @apply min-w-0 break-words text-xs font-semibold leading-snug;
  overflow-wrap: anywhere;
}

.status-encounter-card__identity {
  @apply min-w-0 break-words text-[10px] leading-snug;
  color: var(--status-theme-muted);
  overflow-wrap: anywhere;
}

.status-encounter-card__trust {
  @apply shrink-0 rounded-full px-1.5 py-0.5 text-[10px];
  color: var(--status-theme-text);
  background-color: color-mix(in srgb, var(--status-theme) 18%, transparent);
}

.status-encounter-card__chevron {
  @apply text-[10px] transition-transform duration-150;
  color: var(--status-theme-muted);
}

.status-encounter-card--expanded .status-encounter-card__chevron {
  @apply rotate-180;
}

.status-encounter-card__body {
  @apply relative grid gap-2 overflow-hidden border-t px-2.5 pb-2.5 pt-2;
  border-color: color-mix(in srgb, var(--status-theme) 24%, transparent);
}

.status-encounter-card-expand-enter-active,
.status-encounter-card-expand-leave-active {
  transition:
    opacity 140ms ease-out,
    transform 140ms ease-out;
}

.status-encounter-card-expand-enter-from,
.status-encounter-card-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.status-encounter-card__portrait {
  @apply pointer-events-none absolute right-[-1.5rem] top-0 z-0 h-72 max-w-none object-contain object-top opacity-25;
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--status-theme) 42%, transparent));
}

.status-encounter-card__section {
  @apply relative z-10 min-w-0;
}

.status-encounter-card__section-title {
  @apply m-0 mb-1 text-[11px] font-semibold;
  color: var(--status-theme-text);
}

.status-encounter-card__text {
  @apply m-0 break-words rounded-md px-2 py-1.5 text-[11px] leading-snug;
  color: color-mix(in srgb, var(--status-theme-text) 90%, var(--status-theme-muted));
  background-color: color-mix(in srgb, var(--status-theme-soft) 34%, transparent);
  overflow-wrap: anywhere;
}

.status-encounter-card__entry-list {
  @apply grid gap-1;
}

.status-encounter-card__entry {
  @apply min-w-0 rounded-md px-2 py-1 text-[10px];
  background-color: color-mix(in srgb, var(--status-theme-soft) 34%, transparent);
}

.status-encounter-card__entry-head {
  @apply flex min-w-0 items-baseline gap-1.5;
}

.status-encounter-card__entry-name {
  @apply min-w-0 break-words text-[12px] font-semibold leading-tight;
  color: var(--status-theme-text);
  overflow-wrap: anywhere;
}

.status-encounter-card__entry-quantity,
.status-encounter-card__entry-desc,
.status-encounter-card__entry-meta {
  @apply mt-0.5 block break-words text-[10px] leading-snug;
  color: var(--status-theme-muted);
  overflow-wrap: anywhere;
}

.status-encounter-card__entry-desc {
  @apply text-[11px];
  color: color-mix(in srgb, var(--status-theme-text) 86%, var(--status-theme-muted));
}

.status-encounter-card__entry-meta {
  @apply inline-block rounded px-1 py-0.5;
  background-color: color-mix(in srgb, var(--status-theme) 16%, transparent);
}

@media screen and (max-width: 420px) {
  .status-encounter-card__header {
    @apply gap-1.5 px-2 py-1.5;
  }

  .status-encounter-card__header--with-avatar {
    @apply grid-cols-[2.25rem_minmax(0,1fr)_auto_auto];
  }

  .status-encounter-card__avatar {
    @apply size-8;
  }

  .status-encounter-card__body {
    @apply px-2 pb-2;
  }
}
</style>

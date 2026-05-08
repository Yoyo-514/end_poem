<script setup lang="ts">
import type { StatusCompanionProfile, StatusCompanionSection } from './companion-presenters';

interface Props {
  profile: StatusCompanionProfile;
}

defineProps<Props>();

const maskText = '████████';

const shouldShowSection = (profile: StatusCompanionProfile, section: StatusCompanionSection): boolean => {
  return profile.locked || section.entries.length > 0;
};
</script>

<template>
  <article
    class="companion-detail"
    :class="[`companion-detail--${profile.theme}`, { 'companion-detail--locked': profile.locked }]"
  >
    <img
      v-if="profile.portrait && !profile.mystery"
      class="companion-detail__portrait"
      :class="{ 'companion-detail__portrait--locked': profile.locked }"
      :src="profile.portrait"
      :alt="profile.name"
      aria-hidden="true"
    />

    <div class="companion-detail__content">
      <header class="companion-detail__header">
        <div class="companion-detail__identity">
          <span class="companion-detail__name">{{ profile.locked ? '???' : profile.name }}</span>
          <span v-if="profile.locked" class="companion-detail__locked-label">资料遮蔽</span>
          <span v-else-if="profile.joined && profile.id !== 'user'" class="companion-detail__joined-label">同行中</span>
        </div>
        <div class="companion-detail__tag-row">
          <span class="companion-detail__tag-label">身份</span>
          <div class="companion-detail__tag-list">
            <span v-for="role in profile.roles" :key="role" class="companion-detail__tag">
              {{ profile.locked ? maskText : role }}
            </span>
            <span v-if="profile.roles.length === 0" class="companion-detail__tag">
              {{ profile.locked ? maskText : '身份未记录' }}
            </span>
          </div>
        </div>
        <div v-if="profile.status.length > 0 || profile.locked" class="companion-detail__tag-row">
          <span class="companion-detail__tag-label">状态</span>
          <div class="companion-detail__tag-list">
            <span
              v-for="status in profile.locked ? profile.status.slice(0, 3) : profile.status"
              :key="status"
              class="companion-detail__status-tag"
            >
              {{ profile.locked ? maskText : status }}
            </span>
            <span v-if="profile.locked && profile.status.length === 0" class="companion-detail__status-tag">{{
              maskText
            }}</span>
          </div>
        </div>
      </header>

      <div v-if="profile.metrics.length > 0 || profile.locked" class="companion-detail__metrics">
        <span
          v-for="metric in profile.locked ? profile.metrics.slice(0, 3) : profile.metrics"
          :key="metric.label"
          class="companion-detail__metric"
        >
          <span class="companion-detail__metric-label">{{
            profile.locked ? '█'.repeat(metric.label.length || 3) : metric.label
          }}</span>
          <span class="companion-detail__metric-value">{{ profile.locked ? maskText : metric.value }}</span>
        </span>
        <span v-if="profile.locked && profile.metrics.length === 0" class="companion-detail__metric">
          <span class="companion-detail__metric-label">███</span>
          <span class="companion-detail__metric-value">{{ maskText }}</span>
        </span>
      </div>

      <div class="companion-detail__sections">
        <section
          v-for="section in profile.sections"
          v-show="shouldShowSection(profile, section)"
          :key="section.id"
          class="companion-detail__section"
        >
          <h4 class="companion-detail__section-title">{{ profile.locked ? '████' : section.title }}</h4>
          <div class="companion-detail__entry-list">
            <div v-for="entry in section.entries" :key="`${section.id}-${entry.label}`" class="companion-detail__entry">
              <span class="companion-detail__entry-head">
                <span v-if="entry.label" class="companion-detail__entry-label">{{
                  profile.locked ? '█'.repeat(entry.label.length || 3) : entry.label
                }}</span>
                <span v-if="entry.quantity && !profile.locked" class="companion-detail__entry-quantity"
                  >×{{ entry.quantity }}</span
                >
              </span>
              <span v-if="entry.description || entry.value !== entry.label" class="companion-detail__entry-value">{{
                profile.locked ? maskText : entry.description || entry.value
              }}</span>
              <span v-if="!profile.locked && entry.description" class="companion-detail__entry-meta">{{
                entry.value
              }}</span>
              <span
                v-for="child in profile.locked ? [] : (entry.children ?? [])"
                :key="`${section.id}-${entry.label}-${child.label}`"
                class="companion-detail__entry-child"
              >
                {{ child.label }}：{{ child.value }}
              </span>
            </div>
          </div>
        </section>

        <section v-if="profile.locked" class="companion-detail__section companion-detail__section--redacted">
          <h4 class="companion-detail__section-title">████</h4>
          <div class="companion-detail__redacted-blocks" aria-label="遮蔽信息">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.companion-detail {
  --companion-accent: var(--status-theme);
  --companion-soft: var(--status-theme-soft);
  --companion-ink: var(--status-theme-text);

  @apply relative min-h-[17rem] overflow-hidden rounded-lg border px-3 py-3;
  color: var(--status-theme-text);
  border-color: color-mix(in srgb, var(--companion-accent) 38%, transparent);
  background:
    radial-gradient(
      circle at right bottom,
      color-mix(in srgb, var(--companion-soft) 45%, transparent),
      transparent 58%
    ),
    color-mix(in srgb, var(--status-theme-soft) 32%, transparent);
}

.companion-detail--traveler {
  --companion-accent: #67e8f9;
  --companion-soft: rgba(103, 232, 249, 0.2);
}

.companion-detail--mio {
  --companion-accent: #a78bfa;
  --companion-soft: rgba(167, 139, 250, 0.22);
}

.companion-detail--shiro {
  --companion-accent: #dbeafe;
  --companion-soft: rgba(219, 234, 254, 0.28);
}

.companion-detail--kohina {
  --companion-accent: #f87171;
  --companion-soft: rgba(248, 113, 113, 0.2);
}

.companion-detail--midori {
  --companion-accent: #f9a8d4;
  --companion-soft: rgba(249, 168, 212, 0.22);
}

.companion-detail--lily {
  --companion-accent: #111827;
  --companion-soft: rgba(17, 24, 39, 0.28);
}

.companion-detail--locked {
  border-color: rgba(0, 0, 0, 0.48);
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0.36)),
    color-mix(in srgb, var(--status-theme-soft) 22%, transparent);
}

.companion-detail__portrait {
  @apply pointer-events-none absolute left-[66%] top-[1rem] z-0 h-[42rem] max-w-none -translate-x-1/2 object-contain object-top opacity-40;
  filter: drop-shadow(0 0 12px color-mix(in srgb, var(--companion-accent) 42%, transparent));
}

.companion-detail__portrait--locked {
  filter: brightness(0) saturate(0);
  opacity: 0.9;
}

.companion-detail__content {
  @apply relative z-10 flex min-w-0 flex-col gap-2;
}

.companion-detail:not(.companion-detail--traveler):not(.companion-detail--lily) .companion-detail__header,
.companion-detail:not(.companion-detail--traveler):not(.companion-detail--lily) .companion-detail__metrics {
  max-width: 72%;
}

.companion-detail__header {
  @apply grid gap-1.5;
}

.companion-detail__identity {
  @apply flex min-w-0 items-center gap-2;
}

.companion-detail__name {
  @apply min-w-0 truncate text-sm font-semibold;
  color: var(--companion-ink);
}

.companion-detail__locked-label,
.companion-detail__joined-label {
  @apply shrink-0 rounded-full px-1.5 py-0.5 text-[10px];
}

.companion-detail__locked-label {
  color: #d1d5db;
  background-color: rgba(0, 0, 0, 0.72);
}

.companion-detail__joined-label {
  color: var(--status-theme-panel-solid);
  background-color: var(--companion-accent);
}

.companion-detail__tag-row {
  @apply flex min-w-0 items-start gap-1.5;
}

.companion-detail__tag-label {
  @apply shrink-0 py-0.5 text-[10px] font-semibold;
  color: var(--status-theme-muted);
}

.companion-detail__tag-list {
  @apply flex min-w-0 flex-wrap gap-1;
}

.companion-detail__tag,
.companion-detail__status-tag {
  @apply rounded-full px-1.5 py-0.5 text-[10px];
  color: var(--status-theme-text);
  background-color: color-mix(in srgb, var(--companion-soft) 72%, transparent);
}

.companion-detail__metrics {
  @apply flex flex-wrap gap-x-3 gap-y-1 rounded-md px-2 py-1 text-[10px];
  background-color: color-mix(in srgb, var(--companion-soft) 42%, transparent);
}

.companion-detail__metric {
  @apply inline-flex min-w-0 items-baseline gap-1.5;
}

.companion-detail__metric-label {
  @apply block font-medium;
  color: var(--status-theme-muted);
}

.companion-detail__metric-value {
  @apply break-words text-xs;
  color: var(--status-theme-text);
  overflow-wrap: anywhere;
}

.companion-detail__entry-value {
  @apply mt-0.5 block break-words text-[11px] leading-snug;
  color: color-mix(in srgb, var(--status-theme-text) 88%, var(--status-theme-muted));
  overflow-wrap: anywhere;
}

.companion-detail__sections {
  @apply grid gap-2;
}

.companion-detail__section {
  @apply min-w-0 border-t pt-2;
  border-color: color-mix(in srgb, var(--companion-accent) 24%, transparent);
}

.companion-detail__section-title {
  @apply m-0 mb-1 text-[11px] font-semibold;
  color: var(--status-theme-text);
}

.companion-detail__entry-list {
  @apply grid gap-1;
}

.companion-detail__entry {
  @apply min-w-0 rounded-md px-2 py-1 text-[10px];
  background-color: color-mix(in srgb, var(--status-theme-soft) 32%, transparent);
}

.companion-detail__entry-head {
  @apply flex min-w-0 items-baseline gap-1.5;
}

.companion-detail__entry-label {
  @apply min-w-0 text-[12px] font-semibold leading-tight;
  color: var(--status-theme-text);
}

.companion-detail__entry-quantity,
.companion-detail__entry-meta,
.companion-detail__entry-child {
  @apply mt-0.5 block break-words text-[10px] leading-snug;
  color: var(--status-theme-muted);
  overflow-wrap: anywhere;
}

.companion-detail__entry-meta {
  @apply inline-block rounded px-1 py-0.5;
  background-color: color-mix(in srgb, var(--companion-soft) 38%, transparent);
}

.companion-detail__redacted-blocks {
  @apply grid gap-1;

  span {
    @apply block h-3 rounded-sm;
    background-color: rgba(0, 0, 0, 0.88);
  }

  span:nth-child(2) {
    @apply w-4/5;
  }

  span:nth-child(3) {
    @apply w-2/3;
  }
}

@media screen and (max-width: 420px) {
  .companion-detail {
    @apply min-h-[18rem] px-2.5 py-2.5;
  }

  .companion-detail__portrait {
    @apply left-[68%] top-[0.5rem] h-[34rem] max-w-none -translate-x-1/2 opacity-35;
  }
}
</style>

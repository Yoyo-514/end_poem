<script setup lang="ts">
import { computed, ref } from 'vue';
import type { RawStatusData } from '../../types/status';
import { buildCompanionProfiles, buildUserCompanionProfile, type StatusCompanionId } from './companion-presenters';
import StatusCompanionAvatarRail from './StatusCompanionAvatarRail.vue';
import StatusCompanionDetailCard from './StatusCompanionDetailCard.vue';

interface Props {
  statusData: RawStatusData;
}

const props = defineProps<Props>();
const activeId = ref<StatusCompanionId | null>(null);

const userProfile = computed(() => buildUserCompanionProfile(props.statusData));
const companionProfiles = computed(() => buildCompanionProfiles(props.statusData));
const allProfiles = computed(() => [userProfile.value, ...companionProfiles.value]);
const activeProfile = computed(() => allProfiles.value.find(profile => profile.id === activeId.value) ?? null);

const selectProfile = (id: StatusCompanionId) => {
  activeId.value = activeId.value === id ? null : id;
};
</script>

<template>
  <section class="status-companion" aria-label="旅行同伴内容">
    <button
      class="status-companion__user"
      :class="{ 'status-companion__user--active': activeId === userProfile.id }"
      type="button"
      :aria-pressed="activeId === userProfile.id"
      @click="selectProfile(userProfile.id)"
    >
      <span class="status-companion__user-main">
        <span class="status-companion__user-title">旅者档案</span>
        <span class="status-companion__user-name">{{ userProfile.name }}</span>
      </span>
      <span class="status-companion__user-tags">
        <span v-for="role in userProfile.roles" :key="role" class="status-companion__tag">{{ role }}</span>
        <span v-if="userProfile.roles.length === 0" class="status-companion__tag">探索者</span>
      </span>
      <span class="status-companion__user-meta">
        <span v-for="summary in userProfile.summary" :key="summary">{{ summary }}</span>
      </span>
    </button>

    <StatusCompanionAvatarRail :profiles="companionProfiles" :active-id="activeId" @select="selectProfile" />

    <div class="status-companion__detail">
      <StatusCompanionDetailCard v-if="activeProfile" :profile="activeProfile" />
      <p v-else class="status-companion__placeholder">选择旅者档案或同伴头像以展开详细资料。</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-companion {
  @apply flex max-h-full min-h-0 w-full flex-col gap-2.5 overflow-hidden;
}

.status-companion__user {
  @apply grid min-w-0 shrink-0 cursor-pointer gap-1 rounded-lg border px-2.5 py-2 text-left transition duration-150;
  color: var(--status-theme-text);
  border-color: var(--status-theme-soft);
  background-color: color-mix(in srgb, var(--status-theme-soft) 36%, transparent);
}

.status-companion__user:hover,
.status-companion__user--active {
  border-color: var(--status-theme);
  background-color: color-mix(in srgb, var(--status-theme-soft) 58%, transparent);
}

.status-companion__user-main {
  @apply flex min-w-0 items-baseline gap-2;
}

.status-companion__user-title {
  @apply shrink-0 text-[10px] font-medium;
  color: var(--status-theme-muted);
}

.status-companion__user-name {
  @apply min-w-0 truncate text-sm font-semibold;
}

.status-companion__user-tags,
.status-companion__user-meta {
  @apply flex min-w-0 flex-wrap gap-1;
}

.status-companion__tag,
.status-companion__user-meta span {
  @apply rounded-full px-1.5 py-0.5 text-[10px];
  color: var(--status-theme-muted);
  background-color: color-mix(in srgb, var(--status-theme-soft) 60%, transparent);
}

.status-companion__detail {
  @apply min-h-0 min-w-0 flex-1 overflow-y-auto pr-1;
  scrollbar-width: thin;
  scrollbar-color: var(--status-theme-soft) transparent;
}

.status-companion__placeholder {
  @apply m-0 rounded-lg px-2.5 py-2 text-xs italic;
  color: var(--status-theme-muted);
  background-color: color-mix(in srgb, var(--status-theme-soft) 36%, transparent);
}

@media screen and (max-width: 420px) {
  .status-companion {
    @apply gap-2;
  }

  .status-companion__user {
    @apply px-2 py-1.5;
  }
}
</style>

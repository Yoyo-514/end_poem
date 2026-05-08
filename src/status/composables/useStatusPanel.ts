import { computed, onMounted, onUnmounted, ref } from 'vue';
import { StatusDataService } from '../services/status-data-service';
import type { StatusSnapshot, StatusTabItem } from '../types/status';

const statusDataService = StatusDataService.getInstance();

export function useStatusPanel() {
  const activeTabId = ref<StatusTabItem['id']>('tasks');
  const snapshot = ref<StatusSnapshot>(statusDataService.getEmptySnapshot(activeTabId.value));
  const eventStops: EventOnReturn[] = [];
  let disposed = false;

  const refreshSnapshot = (force = false) => {
    if (force) {
      statusDataService.clearCache();
    }
    snapshot.value = statusDataService.getSnapshot(activeTabId.value);
  };

  const initializeStatusData = async () => {
    await statusDataService.initialize();
    if (disposed) {
      return;
    }

    eventStops.push(
      eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => refreshSnapshotByEvent('MVU_VARIABLE_UPDATE_ENDED')),
    );
    refreshSnapshot(true);
  };

  const refreshSnapshotByEvent = _.debounce((eventName: string) => {
    console.info('[StatusPanel] 状态刷新事件触发:', eventName);
    refreshSnapshot(true);
  }, 300);

  const bindStatusEvents = () => {
    const register = <T extends EventType>(eventType: T, eventName: string) => {
      eventStops.push(eventOn(eventType, (() => refreshSnapshotByEvent(eventName)) as ListenerType[T]));
    };

    register(tavern_events.CHAT_CHANGED, 'CHAT_CHANGED');
    register(tavern_events.CHAT_CREATED, 'CHAT_CREATED');
    register(tavern_events.CHAT_DELETED, 'CHAT_DELETED');
    register(tavern_events.MESSAGE_SENT, 'MESSAGE_SENT');
    register(tavern_events.MESSAGE_RECEIVED, 'MESSAGE_RECEIVED');
    register(tavern_events.MESSAGE_UPDATED, 'MESSAGE_UPDATED');
    register(tavern_events.MESSAGE_DELETED, 'MESSAGE_DELETED');
    register(tavern_events.MESSAGE_EDITED, 'MESSAGE_EDITED');
    register(tavern_events.MESSAGE_SWIPED, 'MESSAGE_SWIPED');
    register(tavern_events.MESSAGE_SWIPE_DELETED, 'MESSAGE_SWIPE_DELETED');
    register(tavern_events.CHARACTER_MESSAGE_RENDERED, 'CHARACTER_MESSAGE_RENDERED');
    register(tavern_events.USER_MESSAGE_RENDERED, 'USER_MESSAGE_RENDERED');
  };

  const unbindStatusEvents = () => {
    eventStops.splice(0).forEach(stop => stop.stop());
    refreshSnapshotByEvent.cancel();
  };

  const setActiveTab = (tabId: StatusTabItem['id']) => {
    activeTabId.value = tabId;
  };

  const statusData = computed(() => snapshot.value.statusData);
  const mapData = computed(() => snapshot.value.mapData);
  const tabs = computed(() => snapshot.value.tabs);
  const activeTab = computed(() => tabs.value.find(tab => tab.id === activeTabId.value) ?? tabs.value[0]);
  const isAvailable = computed(() => snapshot.value.isAvailable);

  onMounted(() => {
    disposed = false;
    bindStatusEvents();
    void initializeStatusData();
  });

  onUnmounted(() => {
    disposed = true;
    unbindStatusEvents();
    statusDataService.clearCache();
  });

  return {
    activeTabId,
    activeTab,
    statusData,
    mapData,
    tabs,
    isAvailable,
    refreshSnapshot,
    setActiveTab,
  };
}

import type { AudioTrack, FormattedTime } from '../types';
import { PlayerEvent } from '../types/enums';
import { formatTime } from '../utils/audio';

/**
 * 音频播放引擎核心类
 */
export class AudioEngine {
  private readonly audio: HTMLAudioElement;
  private readonly eventListeners: Map<string, Array<(data?: unknown) => void>> = new Map();

  constructor() {
    this.audio = this.createAudioElement();
    this.audio.preload = 'auto';
    this.bindAudioEvents();
  }

  /**
   * 在酒馆主页面创建音频元素，避免 Android WebView 限制隐藏脚本 iframe 的媒体加载
   */
  private createAudioElement(): HTMLAudioElement {
    try {
      const audio = window.parent.document.createElement('audio');
      audio.controls = false;
      audio.setAttribute('aria-hidden', 'true');
      window.parent.document.body.append(audio);
      return audio;
    } catch (error) {
      console.warn('[APlayer] 无法在酒馆主页面创建音频元素，回退到脚本 iframe:', error);
      const audio = document.createElement('audio');
      document.body.append(audio);
      return audio;
    }
  }

  /**
   * 绑定音频元素事件
   */
  private bindAudioEvents(): void {
    const events: (keyof HTMLMediaElementEventMap)[] = [
      'play',
      'pause',
      'ended',
      'timeupdate',
      'loadedmetadata',
      'canplay',
      'progress',
      'error',
    ];

    events.forEach(event => {
      this.audio.addEventListener(event, e => {
        this.emit(event as PlayerEvent, e);
      });
    });
  }

  /**
   * 事件监听
   */
  on(event: PlayerEvent, callback: (data?: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event: PlayerEvent, callback?: (data?: unknown) => void): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: PlayerEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * 加载音频
   */
  async loadTrack(track: AudioTrack): Promise<void> {
    return new Promise((resolve, reject) => {
      // 停止当前播放
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.removeAttribute('src');
      this.audio.load();

      const onCanPlay = () => {
        this.audio.removeEventListener('canplay', onCanPlay);
        this.audio.removeEventListener('error', onError);
        resolve();
      };

      const onError = (_e: Event) => {
        this.audio.removeEventListener('canplay', onCanPlay);
        this.audio.removeEventListener('error', onError);
        const mediaError = this.audio.error;
        const code = mediaError?.code ?? 0;
        const message = mediaError?.message || this.getMediaErrorMessage(code);
        reject(new Error(`音频加载失败: ${track.name} (MediaError ${code}: ${message})`));
      };

      this.audio.addEventListener('canplay', onCanPlay, { once: true });
      this.audio.addEventListener('error', onError, { once: true });

      // 先绑定事件再设置音源，避免部分 Android WebView 丢失快速触发的错误事件
      this.audio.src = track.url;
      this.audio.load();
    });
  }

  /**
   * 获取媒体错误的可读描述
   */
  private getMediaErrorMessage(code: number): string {
    switch (code) {
      case 1: // MEDIA_ERR_ABORTED
        return '媒体加载被中止';
      case 2: // MEDIA_ERR_NETWORK
        return '媒体下载发生网络错误';
      case 3: // MEDIA_ERR_DECODE
        return '媒体解码失败';
      case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
        return '媒体来源不受支持或被安全策略拦截';
      default:
        return '未知媒体错误';
    }
  }

  /**
   * 播放
   */
  async play(): Promise<void> {
    if (this.audio.readyState >= 2) {
      // HAVE_CURRENT_DATA
      try {
        await this.audio.play();
      } catch (error) {
        console.error('播放失败:', error);
        throw error;
      }
    } else {
      // 等待音频加载
      return new Promise((resolve, reject) => {
        const onCanPlay = async () => {
          this.audio.removeEventListener('canplay', onCanPlay);
          try {
            await this.audio.play();
            resolve();
          } catch (error) {
            reject(new Error(`播放失败: ${error}`));
          }
        };
        this.audio.addEventListener('canplay', onCanPlay, { once: true });
      });
    }
  }

  /**
   * 暂停
   */
  pause(): void {
    this.audio.pause();
  }

  /**
   * 跳转到指定时间
   */
  seek(time: number): void {
    this.audio.currentTime = time;
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 获取当前播放时间
   */
  get currentTime(): number {
    return this.audio.currentTime || 0;
  }

  /**
   * 获取音频总时长
   */
  get duration(): number {
    return this.audio.duration || 0;
  }

  /**
   * 获取缓冲进度
   */
  get buffered(): number {
    const buffered = this.audio.buffered;
    if (buffered.length > 0) {
      return buffered.end(buffered.length - 1);
    }
    return 0;
  }

  /**
   * 获取当前音量
   */
  get volume(): number {
    return this.audio.volume;
  }

  /**
   * 是否暂停
   */
  get paused(): boolean {
    return this.audio.paused;
  }

  /**
   * 是否结束
   */
  get ended(): boolean {
    return this.audio.ended;
  }

  /**
   * 获取底层媒体错误，供宿主输出 Android WebView 的真实失败原因
   */
  get mediaError(): MediaError | null {
    return this.audio.error;
  }

  get readyState(): number {
    return this.audio.readyState;
  }

  get networkState(): number {
    return this.audio.networkState;
  }

  /**
   * 获取格式化的当前时间
   */
  get formattedCurrentTime(): FormattedTime {
    return formatTime(this.currentTime);
  }

  /**
   * 获取格式化的总时长
   */
  get formattedDuration(): FormattedTime {
    return formatTime(this.duration);
  }

  /**
   * 销毁音频引擎
   */
  destroy(): void {
    this.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.audio.remove();
    this.eventListeners.clear();
  }
}

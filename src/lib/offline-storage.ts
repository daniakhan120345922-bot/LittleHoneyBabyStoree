// Offline storage using IndexedDB for POS functionality

const DB_NAME = 'LittleHoneyPOS'
const DB_VERSION = 1
const STORE_NAME = 'queuedSales'

interface QueuedSale {
  id: string
  saleData: any
  timestamp: number
  synced: boolean
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  async queueSale(saleData: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const queuedSale: QueuedSale = {
        id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        saleData,
        timestamp: Date.now(),
        synced: false,
      }

      const request = store.add(queuedSale)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getQueuedSales(): Promise<QueuedSale[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.get(id)
      request.onsuccess = () => {
        const data = request.result
        if (data) {
          data.synced = true
          const updateRequest = store.put(data)
          updateRequest.onerror = () => reject(updateRequest.error)
          updateRequest.onsuccess = () => resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async removeSyncedSales(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.openCursor()

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const data = cursor.value
          if (data.synced) {
            cursor.delete()
            cursor.continue()
          } else {
            cursor.continue()
          }
        } else {
          resolve()
        }
      }
    })
  }

  isOnline(): boolean {
    return typeof window !== 'undefined' && navigator.onLine
  }
}

export const offlineStorage = new OfflineStorage()

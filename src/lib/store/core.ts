import * as db from "../db"
import type { AppData } from "../types"

let lastPersistedSnapshot: string = ""

export async function initData() {
  await db.init()
  lastPersistedSnapshot = JSON.stringify(db.getData())
}

export async function refreshFromServer() {
  await db.reloadFromServer()
  lastPersistedSnapshot = JSON.stringify(db.getData())
}

export function getData(): AppData {
  return db.getData()
}

export async function saveData(data: AppData) {
  db.setData(data)
  const currentSnapshot = JSON.stringify(data)

  if (!lastPersistedSnapshot) {
    for (const key of Object.keys(data)) {
      if (key === "seed_version" || key === "config") continue
      db.markDirty(key)
    }
  } else {
    const oldData = JSON.parse(lastPersistedSnapshot)
    for (const key of Object.keys(data)) {
      if (key === "seed_version" || key === "config") continue
      if (JSON.stringify((oldData as any)[key]) !== JSON.stringify((data as any)[key])) {
        db.markDirty(key)
      }
    }
  }

  await db.persist()
  lastPersistedSnapshot = currentSnapshot
}

export function getConfig() {
  return getData().config
}

export async function updateConfig(config: Partial<AppData["config"]>) {
  const data = getData()
  Object.assign(data.config, config)
  await saveData(data)
}

export function getDataRef(): AppData {
  return getData()
}

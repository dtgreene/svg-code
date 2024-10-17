import { proxy, subscribe } from 'valtio';

export const StorageKeys = {
  SETTINGS: 'settings',
  FILE: 'file',
};

export function createStorageProxy(key, defaultValue) {
  const state = proxy(getStoredValue(key, defaultValue));

  subscribe(state, () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Could not persist state: ${error.message}`);
    }
  });

  return state;
}

function getStoredValue(key, defaultValue) {
  try {
    const storageItem = localStorage.getItem(key);

    if (storageItem) {
      return JSON.parse(storageItem);
    }
  } catch {
    console.warn('Could not parse local storage value');
  }

  return defaultValue;
}

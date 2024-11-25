const { contextBridge, ipcRenderer } = require('electron/renderer')
contextBridge.exposeInMainWorld('electronAPI', {
    toggle: (x) => ipcRenderer.send('toggle', x)
})

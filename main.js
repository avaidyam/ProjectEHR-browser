const { app, screen, ipcMain, BrowserWindow } = require('electron')
const path = require('node:path')

// The modal window runs the actual application.
const createModalWindow = () => {
	const win = new BrowserWindow({ 
		width: 800, 
		height: 600,
		transparent: true,
		frame: false,
		closable: false,
		resizable: true,
		movable: true,
		minimizable: false,
		maximizable: true,
		fullScreenable: false,
	})

	// Required for macOS; modal level must be 1 below root level.
	win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
	win.setHiddenInMissionControl(true)
	win.setAlwaysOnTop(true, 'pop-up-menu', 1)

	// Load the modal browser from a preset URL.
	win.loadURL('https://ehr.aditya.vaidyam.me/')

	// Needed to set the window size to the screen size but disable resizing.
	// Modal window is hidden by default!
	win.maximize()
	win.resizable = false
	win.movable = false
	win.hide()
	return win
}

// The root window runs the always-top toggle button.
const createRootWindow = () => {
	const win = new BrowserWindow({ 
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
		width: 100, 
		height: 100, 
		x: screen.getPrimaryDisplay().bounds.width - 100 - 24, 
		y: 24,
		transparent: true,
		frame: false,
		resizable: false,
		closable: false,
		movable: true,
		minimizable: false,
		maximizable: false,
		fullScreenable: false,
		excludedFromShownWindowsMenu: true,
		backgroundColor: "white"
	})

	// Root window must have a window level ABOVE the modal window!
	win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
	win.setHiddenInMissionControl(true)
	win.setAlwaysOnTop(true, 'screen-saver', 1)
	
	// Load an HTML string containing a bare button/text to avoid extra files.
	win.loadURL("data:text/html;charset=utf-8," + encodeURI('<body style="display: flex; align-items: center;"><div style="flex-grow: 1; user-select: none; font-size: 30px; font-weight:bold; font-family: sans-serif; text-align: center;">EHR</div></body>'))
	
	// Add a click listener to activate our preload IPC function.
	win.webContents.on('did-finish-load', () => {
		win.webContents.executeJavaScript(`
			document.body.addEventListener("click", function() { window.electronAPI.toggle(null) })
		`)
	})
	return win
}

// On app start, create both windows.
app.whenReady().then(() => {
	const root = createRootWindow()
	const modal = createModalWindow()

	// When receiving the toggle IPC event from the root window, toggle visibility
	// of the modal window.
	ipcMain.on('toggle', (event, x) => {
		modal.isVisible() ? modal.hide() : modal.show()
	})

	// If enabled, closing the modal window will close the root window, which
	// will then quit the entire app automatically.
	modal.on('close', () => { root.closable = true; root.close() })
	app.on('window-all-closed', app.quit)

	// TODO
	//app.on('activate', () => (BrowserWindow.getAllWindows().length === 0) ?? createAppWindow())
})

const { app, BrowserWindow } = require("electron");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the index.html file
  win.loadFile("dist/your-angular-project/index.html");

  // Open the DevTools.
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window even after users have quit and restarted the app
    // with no documents open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  // On macOS it's common for applications and their menu bar to stay active until the user quits explicitly.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

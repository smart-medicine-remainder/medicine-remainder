# Smart Medicine Reminder Box (College Project Demo)

A simple dashboard built with HTML, CSS and JavaScript only.
All sensor, LED and lid readings are simulated and labelled DEMO. No ESP32 hardware is connected.

## Folder structure

```
smart-medicine-reminder-box/
├── index.html      page structure
├── css/
│   └── style.css   colours, layout, mobile design
├── js/
│   ├── data.js     sample data + saving/loading
│   └── app.js      dashboard logic (reminders, buttons, forms)
└── README.md
```

## How to run in VS Code

1. Install VS Code from https://code.visualstudio.com
2. Open VS Code, choose File > Open Folder, and select `smart-medicine-reminder-box`.
3. Easiest way: right-click `index.html` in the file list and choose "Reveal in File Explorer" (or Finder), then double-click it to open in Chrome or Edge.
4. Better way: install the "Live Server" extension (Extensions icon, search "Live Server"). Then right-click `index.html` and choose "Open with Live Server".

No installation, internet connection or database server is needed.

## Demo steps for faculty

1. Show the summary cards and the schedule table.
2. Click "Trigger Demo Reminder" to show the notification popup.
3. Click "Taken" on the notification: the status, cards, history and chart update.
4. In the Medicine Box section, click "Open Lid" to show that opening a lid does NOT mark a medicine as taken.
5. Add, edit and delete a medicine.
6. Click "Reset Demo Data" to start again.

## How data is saved

Data is stored in the browser (localStorage), so it stays after refreshing the page.
SQLite is not used because this demo does not need a backend server.

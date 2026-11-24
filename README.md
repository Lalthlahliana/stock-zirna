# STOCK ZIRNA V1

Mobile-first Mizo learning app. No real companies, money, market data or account. Simulated prices update automatically about every 10 seconds in Paper Trading. This is simulated practice, not a prediction or investment recommendation.

## Phone test
1. Connect phone and PC to the same trusted Wi-Fi/LAN.
2. Double-click `START.cmd` (Node.js is required on the PC).
3. On the phone, open the printed LAN address in Android Chrome or iPhone Safari. Current PC Ethernet address: `http://192.168.100.56:8765` (may change).
4. If Windows Firewall asks, allow private networks only if you trust this network. Do not expose the port to the internet.
5. Open In, finish lessons, buy and sell fictional shares, check automatic price updates, history, then reload and check progress/records. Try reset and cancel before confirming.
6. Keep the PC server running while using the app. Browser data is local to each device and URL; clearing site data or changing the address may remove access to previous records.

## Source and recovery
The static build is the five files `index.html`, `style.css`, `lessons.js`, `core.js`, `app.js`. No compilation or external packages needed. `server.js` serves only these files. `node test.js` runs focused core tests. Restore the recovery ZIP into an empty folder and run START.cmd. Actual phone acceptance is still required.

# CodeChef ABESEC – Club Events (local)

## Run
1. Install Node.js 18+ from https://nodejs.org
2. In this folder:  `npm install`  then  `npm start`
3. Open http://localhost:3000

Registrations are saved in `club.db` (SQLite, created automatically).
## Admin dashboard
http://localhost:3000/admin  (default login: admin / codechef123)

- **Events tab:** add, edit or delete events; mark one as featured; search and filter by category.
- **Registrations tab:** view every registration, search by name/email/college/phone, filter by event, remove a registration, or download everything as CSV.

Deleting an event also deletes its registrations (you'll get a confirmation prompt first).

Change the admin login:
- Windows (PowerShell): `$env:ADMIN_PASS="mypassword"; npm start`
- Mac/Linux: `ADMIN_PASS=mypassword npm start`

Edit the sample events in the SEED list in `server.js` (only used the first time; delete `club.db` to re-seed).

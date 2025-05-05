# Grit:lab User Profile Page

## Overview
A web application for Grit:lab users to view their profile, XP, audit stats, and interactive graphs. Accessible at [https://olegamobile.github.io/graphql/](https://olegamobile.github.io/graphql/). Login is restricted to the Grit:lab campus.

## Features
- **Login**: Authenticate with Grit:lab credentials (campus-only).
- **Profile**: Displays login, ID, name, surname, total XP, audits made/received, and audit ratio.
- **Graphs**:
  - Audit ratio over time with tooltips.
  - Bar chart of auditors by audit count, with hover for full names.
- **Responsive**: Scales for different screen sizes.
- **Session Management**: Uses JWT tokens stored in `sessionStorage`.

## Technologies
- HTML5, CSS3, JavaScript
- SVG for graphs
- GraphQL for API queries
- Fetch API for HTTP requests

## File Structure
- `index.html`: Page structure
- `assets/styles.css`: Styling with wave animation
- `js/`
  - `app.js`: Main logic
  - `utils.js`: Utilities
  - `queries.js`: GraphQL queries
  - `graphs.js`: SVG graph rendering

## Setup
1. Clone repo: `git clone https://github.com/olegamobile/graphql.git`
2. Serve locally: `python -m http.server 8000`
3. Access at `http://localhost:8000` or [https://olegamobile.github.io/graphql/](https://olegamobile.github.io/graphql/)
4. Requires Grit:lab campus network for API access.

## Usage
- **Login**: Enter Grit:lab credentials on campus.
- **View Profile**: See user info, XP, audits, and graphs.
- **Logout**: Clears session and returns to login.

## API
- **Auth**: Basic Auth for JWT token (`/api/auth/signin`)
- **GraphQL**: Queries for user data, XP, audits, and auditors (`/api/graphql-engine/v1/graphql`)
- Handles invalid tokens by redirecting to login.

## Notes
- Uses Grit:lab API at `https://01.gritlab.ax`.
- Graphs redraw on render for accuracy.
- Created by [Oleg Balandin](https://www.linkedin.com/in/oleg-balandin-0529065/) in May 2025.

## License
MIT License
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:61DAFB,100:6A4C93&height=200&section=header&text=Money%20Ledging%20Frontend&fontSize=42&fontColor=ffffff&animation=fadeIn&desc=React%2019%20%2B%20Vite%20Dashboard%20for%20Loan%20%26%20Ledger%20Management&descAlignY=62&descSize=16" width="100%"/>

<img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&weight=600&size=20&duration=2800&pause=900&color=61DAFB&center=true&vCenter=true&width=620&lines=React+19+%2B+Vite+8+%2B+TailwindCSS+4;Axios-Powered+REST+Client;One-Click+PDF+Ledger+Export;Deployed+Live+on+Vercel" alt="Typing SVG" />

<p>
  <a href="https://money-ledging-frontend.vercel.app/"><img src="https://img.shields.io/badge/🔴_LIVE_DEMO-Visit_App-000000?style=for-the-badge&logo=vercel&logoColor=white" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
</p>

<p>
  <img alt="stars" src="https://img.shields.io/github/stars/ashrithBalaji456/Money_Ledging_Frontend?style=flat-square&color=61DAFB" />
  <img alt="forks" src="https://img.shields.io/github/forks/ashrithBalaji456/Money_Ledging_Frontend?style=flat-square&color=61DAFB" />
  <img alt="issues" src="https://img.shields.io/github/issues/ashrithBalaji456/Money_Ledging_Frontend?style=flat-square&color=61DAFB" />
  <img alt="last commit" src="https://img.shields.io/github/last-commit/ashrithBalaji456/Money_Ledging_Frontend?style=flat-square&color=61DAFB" />
  <img alt="deploy" src="https://img.shields.io/website?url=https%3A%2F%2Fmoney-ledging-frontend.vercel.app&style=flat-square&label=live&color=6A4C93" />
</p>

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,vercel,git" />

</div>

---

## 📖 Overview

The **Money Ledging Frontend** is a fast, responsive dashboard built with **React 19** and **Vite 8**, styled with **TailwindCSS 4**, and connected to the [Money_Ledging_Backend](https://github.com/ashrithBalaji456/Money_Ledging_Backend) REST API via **Axios**. Lenders can manage borrowers, issue loans, log repayments, and export ledger statements as PDF — all from a clean, single-page interface.

🌐 **Live App:** [money-ledging-frontend.vercel.app](https://money-ledging-frontend.vercel.app/)
🔗 **Backend API:** [Money_Ledging_Backend](https://github.com/ashrithBalaji456/Money_Ledging_Backend)

---

## 🧭 App Architecture & Data Flow

```mermaid
flowchart TB
    subgraph UI["🎨 Presentation Layer"]
        Pages[Pages: Login / Dashboard / Borrowers / Loans / Ledger]
        Components[Reusable Components — Tables, Modals, Cards]
        Icons[lucide-react Icons]
    end

    subgraph State["🧠 App Layer"]
        Router[react-router-dom — Routing]
        Context[Auth Context / Token State]
    end

    subgraph Services["🔌 Service Layer"]
        AxiosClient[Axios Instance + Interceptors]
        PDFExport[jsPDF + jspdf-autotable]
    end

    subgraph External["☁️ External"]
        API[Spring Boot Backend API]
    end

    Pages --> Components
    Components --> Icons
    Pages --> Router
    Router --> Context
    Context --> AxiosClient
    AxiosClient -->|JWT Bearer Token| API
    Pages --> PDFExport

    style UI fill:#61DAFB33,stroke:#61DAFB
    style State fill:#6A4C9333,stroke:#6A4C93
    style Services fill:#06B6D433,stroke:#06B6D4
    style External fill:#6DB33F33,stroke:#6DB33F
```

---

## 🔄 User Journey Workflow

```mermaid
flowchart TD
    Start([Visit App]) --> Check{Logged In?}
    Check -- No --> Login[Login Page]
    Login -->|POST /auth/login| Store[Store JWT Token]
    Store --> Dashboard

    Check -- Yes --> Dashboard[📊 Dashboard]
    Dashboard --> Borrowers[👥 Borrowers Page]
    Dashboard --> Loans[💰 Loans Page]
    Dashboard --> Ledger[📒 Ledger Page]

    Borrowers --> AddBorrower[Add / Edit Borrower]
    Loans --> AddLoan[Create Loan]
    Loans --> RecordPayment[Record Repayment]
    Ledger --> ExportPDF[📄 Export PDF Statement]

    AddBorrower -->|Axios POST| API[(Backend API)]
    AddLoan -->|Axios POST| API
    RecordPayment -->|Axios POST| API
    Ledger -->|Axios GET| API

    style Start fill:#61DAFB,color:#000
    style Dashboard fill:#6A4C93,color:#fff
    style ExportPDF fill:#06B6D4,color:#000
```

---

## 🗺️ Routing Map

```mermaid
flowchart LR
    R["/"] --> Login["/login"]
    R --> Dash["/dashboard"]
    Dash --> Borrowers["/borrowers"]
    Dash --> LoansList["/loans"]
    LoansList --> LoanDetail["/loans/:id"]
    Dash --> LedgerPage["/ledger"]
```

> Exact route paths are defined via `react-router-dom` in the app's router config — adjust to match `src/` if route names differ.

---

## 📁 Project Structure

```
Money_Ledging_Frontend/
├── public/
├── src/
│   ├── components/       # Reusable UI components (tables, modals, cards)
│   ├── pages/             # Route-level pages (Login, Dashboard, Loans...)
│   ├── services/          # Axios API client & endpoint wrappers
│   ├── context/           # Auth / global state context
│   ├── utils/             # PDF export helpers, formatters
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## ⚙️ Tech Stack

| Category | Technology |
|---|---|
| UI Library | React 19 |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 (`@tailwindcss/postcss`) |
| Routing | react-router-dom 7 |
| HTTP Client | Axios |
| Icons | lucide-react |
| PDF Export | jsPDF + jspdf-autotable |
| Linting | oxlint |
| Hosting | Vercel |

---

## 📊 Dependency Breakdown

```mermaid
pie title package.json Dependency Weight
    "React + Router" : 30
    "TailwindCSS 4" : 25
    "Axios" : 15
    "jsPDF / autoTable" : 15
    "lucide-react" : 10
    "Tooling (Vite/oxlint)" : 5
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Running instance of [Money_Ledging_Backend](https://github.com/ashrithBalaji456/Money_Ledging_Backend)

### Installation

```bash
git clone https://github.com/ashrithBalaji456/Money_Ledging_Frontend.git
cd Money_Ledging_Frontend
npm install
```

The frontend API client is configured to call `https://money-ledging-backend.onrender.com`.

### Run Dev Server

```bash
npm run dev
```

App runs at `http://localhost:5173` with hot-module reload.

### Build for Production

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 🧾 PDF Ledger Export

```mermaid
sequenceDiagram
    actor U as User
    participant P as Ledger Page
    participant J as jsPDF + autoTable
    participant B as Browser Download

    U->>P: Click "Export PDF"
    P->>P: Fetch ledger data from API
    P->>J: generate table (autoTable)
    J->>J: format PDF document
    J-->>B: trigger file download
    B-->>U: statement.pdf saved
```

---

## 🌍 Deployment

```mermaid
flowchart LR
    Dev[👨‍💻 Local Dev] -->|git push| GH[GitHub — main branch]
    GH -->|auto-deploy| Vercel[▲ Vercel]
    Vercel -->|serves| Live[🌐 money-ledging-frontend.vercel.app]
    Live -->|API calls| Backend[⚙️ Spring Boot Backend]
```

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe your change"
git push origin feature/your-feature
```
Then open a Pull Request against `main`.

## 📄 License

Add a `LICENSE` file (MIT recommended) to formalize usage terms.

---

<div align="center">

[![Backend Repo](https://img.shields.io/badge/⚙️_Backend_Repo-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ashrithBalaji456/Money_Ledging_Backend)
[![Live App](https://img.shields.io/badge/🌐_Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://money-ledging-frontend.vercel.app/)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6A4C93,100:61DAFB&height=120&section=footer" width="100%"/>

</div>

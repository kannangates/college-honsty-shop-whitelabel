# Getting Started

Welcome to the Student Access Login System! This guide will help you get up and running quickly, and show you how to customize the portal for your own college or institution.

## 🚀 Quick Start

### 1. Fork and Clone the Repository

```bash
git clone <your-fork-url>
cd college-honsty-shop-whitelabel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase and other required keys.

### 4. Update College/Branding Information

1. **Edit `whitelabel.json`:**
   - Change `"college_name"` and `"portal_name"` under `"branding"` to your institution’s name.
   - Update `"logo"` and `"favicon"` URLs if you want to use your own logo (place your logo in the `public/` directory, e.g., `public/college-logo.jpg`).
   - Adjust colors, messages, and other settings as needed for your college.

2. **Example:**
   ```json
   "branding": {
     "college_name": "My College",
     "portal_name": "My College Honesty Shop Portal",
     "colors": {
       "primary": "#123456",
       "secondary": "#abcdef",
       "accent": "#fedcba"
     },
     "logo": {
       "url": "/college-logo.jpg",
       "fallback": "https://example.com/fallback.svg"
     },
     "favicon": "/college-logo.jpg"
   }
   ```

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your customized portal.

---

## 🖼️ Customizing Logos

- Place your logo file in the `public/` directory (e.g., `public/college-logo.jpg`).
- Update the `"logo"` and `"favicon"` fields in `whitelabel.json` to point to your logo file.

---

## 🏫 Final Steps

- Review all settings in `whitelabel.json` to ensure your college’s information is correct.
- Commit your changes and push to your forked repository.
- Deploy to your preferred hosting provider (Vercel, Netlify, etc.).

---

## 🛠️ Additional Information

- For advanced configuration, review all sections in `whitelabel.json`.
- For troubleshooting, see the [User Guide](./user-guides/user-guide.md).
- For questions, open an issue or discussion on the repository. 
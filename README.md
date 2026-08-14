# keepenviro.ro

Site de prezentare pentru **KEEP ENVIRO SRL** — servicii în domeniul protecției mediului, Constanța.

Site static (HTML/CSS/JS), fără build. Publicare pe hosting (cPanel / Cyber_Folks):

1. Push pe `main` în acest repo.
2. În cPanel → **Git Version Control** → repo-ul `keepenviro-site` → **Pull or Deploy** → *Update from Remote*, apoi *Deploy HEAD Commit*.
3. `.cpanel.yml` copiază `index.html`, `css/` și `js/` în document root-ul `~/keepenviro.ro/`.

# keepenviro.ro

Site de prezentare pentru **KEEP ENVIRO SRL** — servicii în domeniul protecției mediului, Constanța.

Site static (HTML/CSS/JS), fără build. Publicare pe hosting (cPanel / Cyber_Folks):

1. Push pe `main` în acest repo.
2. În cPanel → **Git Version Control** → repo-ul `keepenviro-site` → **Pull or Deploy** → *Update from Remote*, apoi *Deploy HEAD Commit*.
3. `.cpanel.yml` copiază `index.html`, `.htaccess`, `css/` și `js/` în `~/public_html/`,
   document root-ul domeniului principal al contului. Până pe 2026-10-07 keepenviro.ro a
   fost addon, cu document root-ul `~/keepenviro.ro/`; de atunci e domeniul principal.

## Mutarea pe serverul Hetzner (în pregătire din 2026-11-02)

Ținta: serverul Hetzner al Elviriei (`2.29.0.26`, Docker), unde porturile 80/443 sunt
ale Caddy-ului din stiva Elviriei. Site-ul nu-și aduce propriul server web: Caddyfile-ul
Elviriei include blocul lui prin `import /srv/site-uri/*/Caddyfile`, iar repo-ul ăsta
urcă doar în `/srv/site-uri/keepenviro.ro/`:

| Pe server | Din repo | Când intră în vigoare |
|---|---|---|
| `public/` | `index.html`, `css/`, `js/` | imediat (Caddy citește fișierele direct) |
| `Caddyfile` | `deploy/hetzner/Caddyfile` | la `caddy reload` în containerul `web` |

`.github/workflows/deploy-hetzner.yml` validează la fiecare push blocul Caddy exact cum
îl include serverul și, cu variabilele de repo pornite, urcă fișierele prin rsync. Cheia
de deploy e a repo-ului ăstuia, îngrădită pe server la `rrsync -wo /srv/site-uri/keepenviro.ro`.

Până la cutover, cPanel rămâne sursa site-ului (pașii de mai sus); `.htaccess` și
`.cpanel.yml` se retrag odată cu el.

### Pașii mutării

1. **Elviria** (repo-ul ei, regulile ei): în `infra/hetzner/caddy/Caddyfile`, la sfârșit,
   `import /srv/site-uri/*/Caddyfile`; în `infra/hetzner/compose.yaml`, la `web`, volumul
   `/srv/site-uri:/srv/site-uri:ro`. Imaginea `web` reconstruită și pusă pe server.
2. **Serverul**: `sudo install -d -o elviria -g elviria /srv/site-uri/keepenviro.ro`; în
   `~elviria/.ssh/authorized_keys`, cheia de deploy a repo-ului ăstuia cu
   `command="/usr/bin/rrsync -wo /srv/site-uri/keepenviro.ro",restrict`.
3. **GitHub** (repo-ul ăsta): secretele `HETZNER_SSH_KEY`, `HETZNER_KNOWN_HOSTS`,
   `HETZNER_HOST` (`elviria@2.29.0.26`), apoi `HETZNER_DEPLOY_ACTIV=true`: fișierele ajung
   pe server, încă nefolosite.
4. **DNS, cu ≥4 ore înainte** (cPanel → Zone Editor): TTL-ul A-ului `keepenviro.ro` de
   la 14400 la 300; `mail.` și `ftp.keepenviro.ro`, azi CNAME spre `keepenviro.ro`, devin
   A spre `176.223.121.69`, ca să rămână pe cPanel. MX-ul (Microsoft 365), SPF-ul,
   `autodiscover`, `elviria.` și celelalte nu se ating.
5. **Cutover**: A-ul `keepenviro.ro` spre `2.29.0.26` (`www` e CNAME, îl urmează);
   `HETZNER_CADDY_ACTIV=true` și un deploy; `caddy reload` în `web`
   (`docker compose exec web caddy reload --config /etc/caddy/Caddyfile`). Caddy ia
   certificatul la prima încercare, fiindcă DNS-ul trimite deja la el.
6. **După**: copia de pe cPanel rămâne două săptămâni, pentru rezolvitoarele întârziate;
   apoi se scot `.htaccess`, `.cpanel.yml` și repo-ul din Git Version Control.

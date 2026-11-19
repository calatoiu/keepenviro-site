# keepenviro.ro

Site de prezentare pentru **KEEP ENVIRO SRL** — servicii în domeniul protecției mediului, Constanța.

Site static (HTML/CSS/JS), fără build. **Din 2026-11-19 stă pe serverul Hetzner al Elviriei**
(`2.29.0.26`, Docker). Site-ul nu-și aduce propriul server web: îl servește Caddy-ul din stiva
Elviriei, care include blocul lui prin `import /srv/site-uri/*/Caddyfile`.

## Publicarea

**Un push pe `main` în acest repo, atât.** Workflow-ul `.github/workflows/deploy-hetzner.yml`
validează întâi blocul Caddy exact cum îl include serverul, apoi urcă fișierele prin rsync în
`/srv/site-uri/keepenviro.ro/` și verifică site-ul din afară. Durează sub un minut. Un deploy
fără commit nou: Actions → Deploy Hetzner → Run workflow.

| Pe server | Din repo | Când intră în vigoare |
|---|---|---|
| `public/` | `index.html`, `css/`, `js/` | imediat (Caddy citește fișierele direct) |
| `Caddyfile` | `deploy/hetzner/Caddyfile` | la reîncărcarea lui Caddy (mai jos) |

**O schimbare în `deploy/hetzner/Caddyfile`** (antete, redirecționări) intră în vigoare abia la
următorul deploy al Elviriei, care repornește containerul `web`, sau la o reîncărcare dată pe
server, în `/srv/elviria`:

```bash
docker compose exec -T web caddy reload --config /etc/caddy/Caddyfile --force
```

Fără `--force`, un reload cu aceeași configurație principală e ignorat, iar fișierul inclus nu
se recitește. **Un `Caddyfile` stricat al site-ului oprește și Elviria** la următoarea pornire a
lui `web`: de aceea CI-ul îl validează înainte, iar dacă validarea pică, nu se urcă nimic.

Cheia de deploy e a repo-ului ăstuia, nu a Elviriei, iar pe server e îngrădită în
`~elviria/.ssh/authorized_keys` la `rrsync -wo /srv/site-uri/keepenviro.ro`: poate scrie doar
acolo. Ce folosește workflow-ul, în Settings → Secrets and variables → Actions:

- secretele `HETZNER_SSH_KEY`, `HETZNER_KNOWN_HOSTS`, `HETZNER_HOST` (`elviria@2.29.0.26`);
- variabilele `HETZNER_DEPLOY_ACTIV=true` (fișierele) și `HETZNER_CADDY_ACTIV=true` (Caddyfile-ul).

## DNS

Zona `keepenviro.ro` e încă la cyber_folks (cPanel → Zone Editor). Cum arată din 2026-11-19:

| Nume | Înregistrare | Unde duce |
|---|---|---|
| `keepenviro.ro` | A, TTL 300 | `2.29.0.26` (Hetzner) |
| `www.keepenviro.ro` | CNAME | `keepenviro.ro`, deci tot Hetzner; Caddy îl trimite la `keepenviro.ro` (301) |
| `mail.`, `ftp.keepenviro.ro` | A | `176.223.121.69` (cPanel) |
| MX | — | Microsoft 365 (`keepenviro-ro.mail.protection.outlook.com`) |
| `elviria.`, `www.elviria.keepenviro.ro` | A | aplicația Elviria, tot pe Hetzner |

MX-ul, SPF-ul și `autodiscover` sunt ale poștei (Microsoft 365) și nu se ating când se schimbă
ceva la site.

## Copia de pe cPanel, până pe 2026-12-03

cPanel-ul (cyber_folks) are încă site-ul în `~/public_html/`, pus acolo din cPanel → Git Version
Control, prin `.cpanel.yml`. **Nu se mai actualizează:** un push pe `main` ajunge doar pe
Hetzner. Rămâne două săptămâni, pentru rezolvitoarele DNS întârziate și ca revenire (A-ul
`keepenviro.ro` înapoi la `176.223.121.69`). Pe 2026-12-03 se scot de pe cPanel fișierele din
`public_html` și repo-ul din Git Version Control, iar din repo `.htaccess` și `.cpanel.yml`
(antetele site-ului stau acum în `deploy/hetzner/Caddyfile`).

## Cum s-a mutat (2026-11-02 – 2026-11-19)

1. **Elviria:** `import /srv/site-uri/*/Caddyfile` la sfârșitul Caddyfile-ului ei și volumul
   `/srv/site-uri:/srv/site-uri:ro` pe `web`, în `infra/hetzner/compose.yaml`.
2. **Serverul:** directorul `/srv/site-uri/keepenviro.ro`, al utilizatorului `elviria`, și cheia
   de deploy a repo-ului ăstuia în `authorized_keys`, cu
   `command="/usr/bin/rrsync -wo /srv/site-uri/keepenviro.ro",restrict`.
3. **GitHub:** secretele de mai sus și `HETZNER_DEPLOY_ACTIV=true`, din 2026-11-02: fișierele au
   stat pe server, nefolosite, până la mutare.
4. **DNS, cu ore înainte:** TTL-ul A-ului `keepenviro.ro` coborât la 300; `mail.` și `ftp.`, până
   atunci CNAME spre `keepenviro.ro`, făcute A spre cPanel, ca să rămână acolo.
5. **Mutarea, pe 2026-11-19, ~11:15:** `HETZNER_CADDY_ACTIV=true` și un deploy (Caddyfile-ul pe
   server, încă inactiv); A-ul `keepenviro.ro` spre `2.29.0.26` (`www` e CNAME, îl urmează);
   apoi reîncărcarea cu `--force` de mai sus. Certificatele pentru `keepenviro.ro` și `www` au
   venit în 6 secunde, fiindcă DNS-ul trimitea deja la server.

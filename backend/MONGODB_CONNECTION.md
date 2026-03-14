# MongoDB Connection Troubleshooting

## Error: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.xxx.mongodb.net`

This means your network **cannot perform DNS SRV lookup** for `mongodb+srv://` URLs. It's a **DNS/network issue**, not MongoDB credentials or IP whitelist.

### Fix 1: Use Standard Connection String (Recommended)

1. Go to **MongoDB Atlas** → **Database** → Click **Connect** on your cluster  
2. Choose **Drivers** (or "Connect your application")  
3. Look for **"Connection string only"** or switch to **Standard connection format**  
4. Copy the `mongodb://` (not `mongodb+srv://`) string  

Or manually build it. For cluster `cluster0.yk1gbwz.mongodb.net`, the hosts are usually:
- `cluster0-shard-00-00.yk1gbwz.mongodb.net:27017`
- `cluster0-shard-00-01.yk1gbwz.mongodb.net:27017`
- `cluster0-shard-00-02.yk1gbwz.mongodb.net:27017`

**Format:**
```
mongodb://USERNAME:PASSWORD@cluster0-shard-00-00.yk1gbwz.mongodb.net:27017,cluster0-shard-00-01.yk1gbwz.mongodb.net:27017,cluster0-shard-00-02.yk1gbwz.mongodb.net:27017/mini_project?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin
```

Replace:
- `USERNAME` and `PASSWORD` (URL-encode special chars in password)
- `atlas-xxxxx-shard-0` – find in Atlas under **Database** → **Connect** → connection string options

### Fix 2: Change DNS Server

- Windows: Settings → Network → Change adapter options → Properties → IPv4 → Use DNS: `8.8.8.8` (Google) or `1.1.1.1` (Cloudflare)

### Fix 3: Network Checks

- Disable VPN and try again  
- Try mobile hotspot instead of WiFi  
- Temporarily disable antivirus/firewall  
- If on corporate/school network, ask IT if they block SRV records  

### Fix 4: URL-encode Password

If the password has special characters (`@`, `#`, `!`, etc.), URL-encode them in the connection string (e.g. `@` → `%40`).

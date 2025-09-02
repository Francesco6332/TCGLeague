# 🖼️ Guida per Hosting Immagini Gratuito

## 🎯 **Soluzioni Gratuite per le Immagini**

Hai diverse opzioni gratuite per ospitare le immagini delle carte One Piece TCG:

## 🚀 **Opzione 1: Google Drive (Raccomandato)**

### **✅ Vantaggi:**
- **15 GB gratuiti** di spazio
- **Link pubblici diretti** alle immagini
- **API robusta** e ben documentata
- **Nessun limite** di bandwidth
- **Facile da configurare**

### **📋 Setup Google Drive:**

#### **Passo 1: Crea un Progetto Google Cloud**
1. **Vai a**: https://console.cloud.google.com/
2. **Crea un nuovo progetto** o seleziona uno esistente
3. **Abilita Google Drive API**:
   - Vai su "APIs & Services" → "Library"
   - Cerca "Google Drive API"
   - Clicca "Enable"

#### **Passo 2: Crea le Credenziali**
1. **Vai su**: "APIs & Services" → "Credentials"
2. **Clicca**: "Create Credentials" → "Service Account"
3. **Compila i dettagli**:
   - Name: `TCG League Images`
   - Description: `Service account for TCG card images`
4. **Clicca**: "Create and Continue"
5. **Scarica il file JSON** delle credenziali
6. **Rinominalo**: `google-credentials.json`
7. **Mettilo nella root** del progetto

#### **Passo 3: Carica le Immagini**
```bash
# Installa le dipendenze (già fatto)
npm install googleapis

# Esegui lo script di upload
node google-drive-upload.js
```

#### **Passo 4: Aggiorna il Codice**
Dopo l'upload, lo script genererà `drive-file-ids.js`. Aggiorna `imageService.ts`:

```typescript
import { DRIVE_FILE_IDS } from './drive-file-ids.js';

// Sostituisci il metodo getDriveFileIds()
static getDriveFileIds(): Record<string, string> {
  return DRIVE_FILE_IDS;
}
```

## 📦 **Opzione 2: Dropbox**

### **✅ Vantaggi:**
- **2 GB gratuiti** di spazio
- **Link pubblici** semplici
- **API facile** da usare
- **Nessun limite** di download

### **📋 Setup Dropbox:**

#### **Passo 1: Crea un'App Dropbox**
1. **Vai a**: https://www.dropbox.com/developers/apps
2. **Clicca**: "Create app"
3. **Scegli**: "Dropbox API"
4. **Scegli**: "Full Dropbox" access
5. **Nome app**: `TCG League Images`

#### **Passo 2: Genera Access Token**
1. **Vai su**: "Settings" → "OAuth 2"
2. **Genera access token**
3. **Copia il token**

#### **Passo 3: Aggiorna lo Script**
Modifica `dropbox-upload.js`:
```javascript
const DROPBOX_ACCESS_TOKEN = 'IL_TUO_TOKEN_QUI';
```

#### **Passo 4: Carica le Immagini**
```bash
node dropbox-upload.js
```

## 🔧 **Opzione 3: Soluzione Manuale (Più Semplice)**

Se preferisci una soluzione più semplice, puoi:

### **📋 Upload Manuale su Google Drive:**
1. **Vai su**: https://drive.google.com
2. **Crea una cartella**: "TCG Cards"
3. **Carica le immagini** manualmente
4. **Per ogni immagine**:
   - Tasto destro → "Get link"
   - Clicca "Copy link"
   - Il link sarà: `https://drive.google.com/file/d/FILE_ID/view`
   - Usa: `https://drive.google.com/uc?export=view&id=FILE_ID`

### **📝 Aggiorna il Codice Manualmente:**
```typescript
static getDriveFileIds(): Record<string, string> {
  return {
    'OP01-OP01-001': '1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'OP01-OP01-002': '1Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    // Aggiungi più mapping man mano che carichi
  };
}
```

## 🎯 **Raccomandazione**

**Google Drive** è la soluzione migliore perché:
- ✅ **Più spazio gratuito** (15 GB vs 2 GB)
- ✅ **API più robusta**
- ✅ **Link diretti** alle immagini
- ✅ **Nessun limite** di bandwidth

## 🚀 **Prossimi Passi**

1. **Scegli la tua soluzione** (Google Drive raccomandato)
2. **Segui la guida** per il setup
3. **Carica le immagini** con lo script
4. **Aggiorna il codice** con i file ID
5. **Testa il deck builder** - dovrebbe mostrare le immagini reali!

## 📊 **Confronto delle Soluzioni**

| Servizio | Spazio Gratuito | Link Diretti | API | Setup |
|----------|----------------|--------------|-----|-------|
| **Google Drive** | 15 GB | ✅ | ✅ | Medio |
| **Dropbox** | 2 GB | ✅ | ✅ | Facile |
| **Cloudflare Images** | 100k immagini | ✅ | ✅ | Complesso |

**Quale soluzione preferisci provare?** 🎯

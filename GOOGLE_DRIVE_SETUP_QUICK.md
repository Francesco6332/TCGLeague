# 🚀 Setup Rapido Google Drive per le Immagini

## 🎯 **Hai già tutto pronto!**

Le tue cartelle Google Drive contengono **tutte le immagini** delle carte One Piece TCG:

### 📁 **Le tue Cartelle:**
1. **Cartella 1**: OP01-OP05, ST01-ST04
2. **Cartella 2**: EB1, EB2, OP6-OP10, ST5-ST20, PRB01
3. **Cartella 3**: EB02, EB03, OP11-OP13, ST21-ST28, PRB02

## 🔧 **Passo 1: Crea le Credenziali Google**

1. **Vai a**: https://console.cloud.google.com/
2. **Crea un nuovo progetto** o seleziona uno esistente
3. **Abilita Google Drive API**:
   - "APIs & Services" → "Library"
   - Cerca "Google Drive API" → "Enable"
4. **Crea credenziali**:
   - "APIs & Services" → "Credentials"
   - "Create Credentials" → "Service Account"
   - Nome: `TCG League Images`
   - Scarica il JSON → Rinomina in `google-credentials.json`
   - Mettilo nella root del progetto

## 🔍 **Passo 2: Scansiona le Cartelle**

```bash
# Esegui lo script per scansionare le cartelle
node google-drive-folder-scanner.js
```

Questo script:
- ✅ Scansiona tutte e 3 le cartelle
- ✅ Trova tutte le immagini delle carte
- ✅ Genera il mapping dei file ID
- ✅ Crea `drive-file-ids.js` automaticamente

## 🔗 **Passo 3: Aggiorna il Codice**

Dopo la scansione, aggiorna `imageService.ts`:

```typescript
// Aggiungi questa riga in cima al file
import { DRIVE_FILE_IDS } from './drive-file-ids.js';

// Sostituisci il metodo getDriveFileIds()
static getDriveFileIds(): Record<string, string> {
  return DRIVE_FILE_IDS;
}
```

## 🎉 **Passo 4: Testa!**

Il deck builder ora mostrerà le **immagini reali** delle carte invece dei placeholder!

## 📊 **Cosa otterrai:**

- ✅ **Tutte le carte** da OP01 a OP13
- ✅ **Tutti gli starter deck** da ST01 a ST28
- ✅ **Tutti gli extra booster** EB1, EB2, EB02, EB03
- ✅ **Tutti i promotional** PRB01, PRB02
- ✅ **Link diretti** alle immagini su Google Drive
- ✅ **Nessun limite** di bandwidth

## 🚀 **Prossimi Passi:**

1. **Crea le credenziali** Google Cloud
2. **Esegui lo script** di scansione
3. **Aggiorna il codice** con i file ID
4. **Testa il deck builder** - dovrebbe funzionare perfettamente!

**Pronto per iniziare?** 🎯

# Themes für 16Launcher

Ein Theme ist ein Ordner mit einer CSS-Datei, die das Aussehen des Launchers ändert: Farben, Hintergrund, Eckenradius, Panels, Buttons. Hier steht alles, was du brauchst, um ein fremdes Theme zu installieren oder ein eigenes zu bauen.

## Schnellstart

1. Öffne **Einstellungen → Launcher → Benutzerdefiniertes Theme** und klicke auf **Theme erstellen**.
2. Gib einen Namen ein, zum Beispiel `Mein Theme`. Der Launcher legt einen Ordner mit `theme.json` und `style.css` an.
3. Klicke auf **CSS bearbeiten** und füge ein:

   ```css
   :root {
     --accent-color: #10b981;
   }

   .glass-panel {
     background: rgba(6, 40, 30, 0.75) !important;
   }

   .accent-bg {
     background: #10b981 !important;
   }
   ```

4. Speichere die Datei, wähle **Standard** und danach wieder dein Theme. Jetzt sind die Änderungen aktiv.
5. Wenn alles passt, packe den Theme-Ordner als ZIP und schick ihn Freunden oder lade ihn in den [Theme-Katalog](/themes/upload) hoch.

Weiter unten dieselben Schritte noch einmal im Detail.

## Woraus ein Theme besteht

Mindestens zwei Dateien:

| Datei | Inhalt |
| --- | --- |
| `theme.json` | Name, Autor, Beschreibung und Version |
| `style.css` | Stile, die die Oberfläche verändern |

Daneben kannst du Bilder und Schriften ablegen:

```text
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2
```

Ein Theme ersetzt die Oberfläche nicht, sondern legt sich über das Standard-Design. Das Layout des Launchers bleibt gleich: Ein Panel umfärben geht, Buttons verschieben nicht.

## Wo Themes liegen

| System | Ordner |
| --- | --- |
| Windows | `%APPDATA%\16Launcher\themes\` |
| Linux | `~/.local/share/16Launcher/themes/` |
| macOS | `~/Library/Application Support/16Launcher/themes/` |

Am einfachsten öffnest du den Ordner direkt im Launcher: **Einstellungen → Launcher → Benutzerdefiniertes Theme → Theme-Ordner öffnen**.

Jedes Theme hat einen eigenen Ordner, die Dateien liegen direkt darin:

```text
themes/
├── example-theme/
│   ├── theme.json
│   └── style.css
└── my-cool-theme/
    ├── theme.json
    ├── style.css
    └── background.png
```

Liegen `theme.json` und `style.css` direkt in `themes/` oder eine Ebene zu tief, findet der Launcher das Theme nicht.

## Theme aktivieren

1. Öffne **Einstellungen** → Tab **Launcher**.
2. Öffne im Bereich **Anpassung** den Punkt **Benutzerdefiniertes Theme**.
3. Wähle ein Theme aus der Liste.

Das Theme wird sofort angewendet und gemerkt, nach einem Neustart musst du es nicht erneut auswählen. Zurück zum normalen Aussehen kommst du mit **Standard**. Der Theme-Ordner bleibt dabei erhalten.

## Installation

### Aus einem ZIP-Archiv

1. Öffne **Einstellungen → Launcher → Benutzerdefiniertes Theme**.
2. Klicke auf **ZIP importieren** und wähle das Archiv.
3. Wähle das neue Theme in der Liste.

Beide Archiv-Varianten funktionieren: Dateien im Wurzelverzeichnis oder in einem einzelnen Ordner.

```text
ocean-mint.zip              ocean-mint.zip
├── theme.json              └── ocean-mint/
└── style.css                   ├── theme.json
                                └── style.css
```

Beim Import wird die Theme-ID aus dem Archivnamen gebildet. Aus `Ocean Mint.zip` wird `ocean-mint`. Benenne das Archiv also am besten gleich in Kleinbuchstaben und ohne Leerzeichen.

### Manuell

Kopiere den Theme-Ordner nach `themes` und wähle ihn in den Einstellungen aus. War die Theme-Liste beim Kopieren geöffnet, wechsle kurz den Tab oder starte den Launcher neu.

Das ist praktisch, solange du noch am Theme arbeitest: Du bearbeitest die Dateien direkt im Ordner und musst nicht jedes Mal ein neues Archiv packen.

## ID und Name

Ein Theme hat zwei Namen, und die sind nicht dasselbe.

Die **ID** ist der Ordnername auf der Festplatte, zum Beispiel `ocean-mint`. Erlaubt sind lateinische Kleinbuchstaben, Ziffern, `-` und `_`. Keine Leerzeichen, keine Sonderzeichen.

```text
ocean-mint     ✓
dark-glass     ✓
theme_01       ✓
Mein Theme!!!  ✗
theme 1        ✗
```

Mit **Theme erstellen** wird die ID aus dem Namen gebildet (`Ocean Mint` → `ocean-mint`), beim Import aus dem Namen der ZIP-Datei.

Der **Name** ist das, was in der Theme-Liste steht. Er kommt aus dem Feld `name` in `theme.json` und darf beliebig aussehen: Umlaute, Leerzeichen, Großbuchstaben. Ein Ordner namens `dark-glass` kann im Launcher problemlos als „Dunkles Glas“ erscheinen.

## theme.json

```json
{
  "name": "Smaragdozean",
  "author": "BAZA",
  "description": "Ein grün-türkises Theme für 16Launcher",
  "version": "1.0.0"
}
```

| Feld | Bedeutung |
| --- | --- |
| `name` | Name in der Theme-Liste |
| `author` | Autor |
| `description` | Kurzbeschreibung |
| `version` | Version, z. B. `1.0` oder `1.2.0` |

Alle Felder sind optional. Ohne `name` zeigt der Launcher den Ordnernamen an. Wenn andere dein Theme herunterladen sollen, füll alles aus und erhöhe `version` bei spürbaren Änderungen.

Speichere die Datei als **UTF-8**. In einer anderen Kodierung werden Umlaute und andere Sonderzeichen im Namen zu Zeichensalat.

## style.css

Ganz normales CSS. Variablen, Verläufe, `url(...)`, `@font-face`, Pseudoklassen und alles andere, was die Launcher-Oberfläche unterstützt, funktionieren.

```css
:root {
  --accent-color: #10b981;
}

.glass-panel {
  background: rgba(6, 40, 30, 0.75) !important;
  border-color: rgba(16, 185, 129, 0.35) !important;
}

.interactive-press {
  border-radius: 16px !important;
}
```

### Wann du !important brauchst

Die eingebauten Stile des Launchers haben manchmal höhere Priorität, und deine Regel verliert dann stillschweigend. In dem Fall hilft `!important`. Pack es aber nicht überall dran: Prüfe zuerst, ob die Regel ohne funktioniert. Je weniger `!important`, desto leichter findest du später heraus, woher ein Stil kommt.

### Änderungen sind nicht sofort sichtbar

Der Launcher liest `style.css` einmal beim Anwenden des Themes und beobachtet die Datei danach nicht. Wähle nach dem Speichern **Standard** und dann wieder dein Theme, oder starte den Launcher neu.

## Selektoren und Variablen

| Selektor | Was er ändert |
| --- | --- |
| `.glass-panel` | Haupt-Glaspanels |
| `.glass-chip` | Kleine Chips und Badges |
| `.interactive-press` | Buttons und andere klickbare Elemente |
| `.accent-bg` | Akzent-Hintergrund, auch bei manchen Buttons |
| `.accent-border` | Akzent-Rahmen |
| `.accent-chip` | Akzent-Chips |
| `.sidebar-icon-active` | Aktives Icon in der Seitenleiste |
| `--accent-color` | Hauptakzentfarbe, wird in `:root` gesetzt |

Am einfachsten fängst du mit `--accent-color` an: eine Zeile, und der Akzent ändert sich in der ganzen Oberfläche. Nicht jedes Element nutzt aber die Variable, manche musst du über ihre Klassen umfärben.

Gibt es für dein Ziel keine passende Klasse, kannst du einen breiteren Selektor nehmen. Prüf dann nur, dass er nichts Unerwartetes mit erwischt. Die Klassen ändern sich mit dem Launcher, deshalb lohnt es sich, aufwendige Themes nach Updates noch einmal zu testen.

## Bilder und Schriften

Lege die Dateien in den Theme-Ordner und binde sie mit einem relativen Pfad ein:

```css
.glass-panel {
  background-image: url(images/background.png) !important;
  background-size: cover !important;
}
```

Der Launcher macht aus `url(images/background.png)` den Pfad zur Datei in deinem Theme. Absolute Pfade wie `C:\Users\User\Desktop\background.png` funktionieren nur auf deinem Rechner: Bei anderen gibt es diese Datei nicht.

Schriften bindest du über `@font-face` ein:

```css
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}
```

Ein paar Tipps:

- Pack keinen 20-MB-Hintergrund ins Theme. Schöner wird der Launcher dadurch nicht, aber der Download nervt.
- Wenn du das Theme teilen willst, prüfe, ob die Schriftlizenz die Weitergabe erlaubt.
- Groß- und Kleinschreibung in Dateinamen zählt: Unter Linux sind `Background.png` und `background.png` zwei verschiedene Dateien.

## Theme teilen

Packe den Theme-Ordner als ZIP und nenne das Archiv wie die ID: `ocean-mint.zip`. Dann bekommt der Empfänger nach **ZIP importieren** dieselbe ID wie du.

Wirf vor dem Verschicken alles raus, was nicht dazugehört: Entwürfe, `.psd`-Dateien, Reste vom Editor.

### Im Katalog veröffentlichen

Du kannst dein Theme in den [Katalog auf der Website](/themes/upload) hochladen, damit andere es finden. Dafür brauchst du ein 16Launcher-Konto. Grenzen:

- Archiv bis 5 MB;
- `theme.json` und `style.css` sind Pflicht;
- erlaubte Dateien: `.json`, `.css`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.txt`.

Nach dem Hochladen geht das Theme in die Moderation. Das dauert meist 1–2 Tage.

## Theme entfernen

Wähle das Theme in der Liste, klicke auf **Theme löschen** und bestätige. Oder lösche einfach seinen Ordner aus `themes`.

Mitgelieferte Themes wie `example-theme` stellt der Launcher beim nächsten Start wieder her, wenn ihr Ordner fehlt.

## Wenn etwas nicht funktioniert

### Das Theme taucht nicht in der Liste auf

- Liegen im Theme-Ordner sowohl `theme.json` als auch `style.css`?
- Liegen die Dateien direkt im Theme-Ordner und nicht in einem Unterordner?
- Ist der Theme-Ordner in `themes`?
- Ist `theme.json` gültiges JSON? Ein Komma nach dem letzten Feld ist ein häufiger Fehler.

### Das CSS greift nicht

- Ist die Datei gespeichert?
- Hast du das Theme nach dem Speichern neu angewendet (über **Standard** oder einen Neustart)?
- Passt der Selektor wirklich auf das Element?
- Ist ein eingebauter Stil stärker? Versuch es mit `!important`.

### Ein Bild wird nicht angezeigt

Prüfe, dass die Datei im Theme-Ordner liegt, der Pfad in `url(...)` relativ ist und die Groß-/Kleinschreibung im Dateinamen stimmt.

### Die ID ist falsch geworden

Die ID kommt aus dem ZIP-Namen. Benenne das Archiv um und importiere das Theme noch einmal.

### Das Theme ist nach dem Zurücksetzen der Einstellungen weg

Das Zurücksetzen hebt nur die Auswahl auf, der Ordner bleibt. Öffne die Theme-Liste und wähle es erneut.

## Checkliste vor dem Veröffentlichen

- [ ] Ordner-ID in lateinischen Buchstaben, ohne Leerzeichen: `my-theme`
- [ ] `theme.json` und `style.css` sind vorhanden
- [ ] `theme.json` ist UTF-8 und enthält `name`, `author`, `description`, `version`
- [ ] Bilder und Schriften liegen im Theme-Ordner
- [ ] Alle Pfade im CSS sind relativ
- [ ] Das Theme sieht auf allen Launcher-Tabs gut aus, nicht nur auf der Startseite
- [ ] Nach einem Neustart ist das Theme noch aktiv
- [ ] Das ZIP lässt sich über **ZIP importieren** fehlerfrei importieren
- [ ] Im Archiv sind keine überflüssigen Dateien

## Beispiele

Mit dem Launcher kommen zwei Themes, mit denen man gut anfangen kann:

- `example-theme`, ein violettes Demo-Theme;
- `baza-emerald`, ein smaragdgrünes Test-Theme.

Schau dir ihre Ordner an, um zu sehen, wie die Dateien aufgebaut sind. Mehr gibt es im [Theme-Katalog](/themes): Lade dir eins herunter und nimm es auseinander.

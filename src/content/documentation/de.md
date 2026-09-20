# Benutzerdefinierte Themes für 16Launcher

Benutzerdefinierte Themes ermöglichen es Ihnen, das Erscheinungsbild der 16Launcher-Benutzeroberfläche mithilfe von CSS anzupassen. Ein Theme kann Farben, Hintergründe, Abrundungen, Rahmen, Akzentelemente und andere visuelle Eigenschaften der Benutzeroberfläche verändern.

In diesem Artikel wird beschrieben, wie Sie Themes für den 16Launcher installieren, erstellen, konfigurieren, löschen und teilen können. Darüber hinaus wird erläutert, wo genau Themes gespeichert werden, wie deren Dateien aufgebaut sind, welche Felder in `theme.json` verwendet werden, wie Bilder und Schriftarten eingebunden werden und welche Fehler am häufigsten auftreten sowie wie man diese vermeidet.

## 1. Was ist ein Theme?

Ein Theme für den 16Launcher ist ein separater Ordner mit zwei erforderlichen Dateien:

| Datei | Zweck | 
 | ----- | ----- | 
| `theme.json` | Metadaten des Themes: Name, Autor, Beschreibung und Version | 
| `style.css` | CSS-Stile, die das Erscheinungsbild der Benutzeroberfläche anpassen | 

Zusätzlich können im Theme-Ordner Bilder, Schriftarten und andere für die Gestaltung erforderliche Ressourcen abgelegt werden.

Beispiel für eine Theme-Struktur:

```
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2

```

Die Dateien, zusätzlichen Ressourcen und die Struktur innerhalb des Ordners können je nach Zweck des Themes variieren. `theme.json` und `style.css` müssen jedoch zwingend vorhanden sein.

Es ist wichtig zu verstehen, dass ein Theme die Benutzeroberfläche von 16Launcher nicht vollständig ersetzt. Es wird über das Standarddesign der Anwendung gelegt und verändert dieses mithilfe von CSS-Regeln. Das bedeutet, dass der Benutzer nicht die logische Struktur des Launchers ändert, sondern die Standard-Oberfläche lediglich visuell umfärbt oder ergänzt.

Ein Theme kann beispielsweise:

* die Hauptakzentfarbe ändern;

* Farbe und Transparenz von Bedienfeldern (Panels) anpassen;

* das Erscheinungsbild von Schaltflächen gestalten;

* die Abrundung von Elementen ändern;

* das Design aktiver Elemente in der Seitenleiste anpassen;

* Hintergrundbilder hinzufügen;

* benutzerdefinierte Schriftarten einbinden.

Dies ermöglicht sowohl kleine visuelle Korrekturen als auch komplett überarbeitete Farbschemata. In derselben Anwendung können verschiedene Themes für unterschiedliche Stimmungen verwendet werden: minimal, dunkel, hell, Glas-Optik, Gaming, kontrastreich usw.

### Wie ein benutzerdefiniertes Theme funktioniert

Ein benutzerdefiniertes Theme in 16Launcher funktioniert nach dem Prinzip der CSS-Übersteuerung. Der Launcher enthält bereits eine Grundstruktur und Basisstile, während das Theme lediglich bestimmte Selektoren, Klassen und CSS-Variablen überschreibt.

In der Praxis bedeutet dies, dass das Theme Folgendes tun kann:

* die Hauptakzentfarbe ersetzen;

* den Hintergrund von Objekten überschreiben;

* Schatten, border (Rahmen) und radius (Abrundungen) ändern;

* einzelne Panels halbtransparent machen;

* die Farbe von Text und Symbolen ändern;

* alternative Hintergründe, Farbverläufe und Spezielleffekte festlegen.

Dabei kann nicht die gesamte Benutzeroberfläche von Grund auf neu geschrieben werden, da 16Launcher die Elemente weiterhin nach seiner eigenen Struktur aufbaut. Das Theme muss innerhalb der bestehenden Komponenten der Anwendung arbeiten, anstatt diese manuell zu ersetzen.

### Warum ein Theme nicht nur eine CSS-Datei ist

Die Datei `style.css` ist für sich genommen kein vollständiges "Skript". Sie muss berücksichtigen, dass 16Launcher eigene Klassen, Variablen und Elementstrukturen verwendet. Aus diesem Grund basiert ein Theme fast immer auf bereits vorhandenen CSS-Klassen und -Variablen der Anwendung und nicht auf zufälligen, selbstgeschriebenen Selektoren.

Daher ist es bei der Entwicklung eines Themes wichtig zu verstehen:

* welche Klassen in der Benutzeroberfläche verwendet werden;

* welche Eigenschaften überschrieben werden können;

* welche Teile der Benutzeroberfläche am besten unverändert bleiben sollten;

* wie die Kompatibilität mit Launcher-Updates sichergestellt werden kann.

## 2. Speicherort der Themes

Nach der Installation von 16Launcher werden Themes in einem separaten Ordner namens `themes` gespeichert.

Der Speicherort des Ordners hängt vom Betriebssystem ab:

| Betriebssystem | Theme-Verzeichnis | 
 | ----- | ----- | 
| Windows | `%APPDATA%\16Launcher\themes\` | 
| Linux | `~/.local/share/16Launcher/themes/` | 
| macOS | `~/Library/Application Support/16Launcher/themes/` | 

### Windows

Unter Windows befindet sich das Verzeichnis normalerweise unter folgendem Pfad:

```
C:\Users\<Benutzername>\AppData\Roaming\16Launcher\themes\

```

Ersetzen Sie `<Benutzername>` durch den Namen des aktuellen Windows-Benutzerkontos.

### Linux

Unter Linux befindet sich der Theme-Ordner gewöhnlich im Benutzerverzeichnis:

```
~/.local/share/16Launcher/themes/

```

Dies ist der Standardort für Anwendungsdaten des Benutzers, der normalerweise ohne zusätzliche Rechte beschreibbar ist.

### macOS

Unter macOS werden Themes in der Regel hier gespeichert:

```
~/Library/Application Support/16Launcher/themes/

```

Auch hier wird das Anwendungsdatenverzeichnis des Benutzers verwendet, das nicht mit Systemdateien kollidiert.

### Verzeichnisstruktur

Jedes Theme muss sich in einem eigenen Ordner befinden:

```
themes/
├── example-theme/
│   ├── theme.json
│   └── style.css
│
└── my-cool-theme/
    ├── theme.json
    ├── style.css
    └── background.png

```

Legen Sie nicht mehrere Themes in denselben Ordner. Jedes Theme muss über ein eigenes Verzeichnis verfügen.

### So öffnen Sie das Theme-Verzeichnis

Das Theme-Verzeichnis kann direkt aus der Benutzeroberfläche des Launchers geöffnet werden:

**Einstellungen → Launcher → Benutzerdefiniertes Theme → Theme-Ordner öffnen**

Diese Methode wird empfohlen, wenn Sie ein Theme manuell installieren, ändern oder löschen möchten.

Dieser Weg ist praktisch, weil:

* der Pfad nicht manuell gesucht werden muss;

* kein Risiko besteht, den falschen Ordner zu wählen;

* das gewünschte Theme schnell zum Bearbeiten geöffnet werden kann;

* mehrere installierte Themes einfacher verwaltet werden können.

### Wichtiger Hinweis zu Theme-Ordnern

Die Theme-Dateien müssen sich direkt im Theme-Ordner befinden und nicht im Stammverzeichnis des Ordners `themes` oder ohne Notwendigkeit in mehreren verschachtelten Unterordnern. Wenn 16Launcher in einem bestimmten Verzeichnis nach Themes sucht, muss jedes Theme als einzelner Ordner mit korrekter Struktur vorliegen.

## 3. So aktivieren Sie ein Theme

Nach der Installation erscheint das Theme in der Liste der verfügbaren Themes.

So aktivieren Sie ein Theme:

1. Öffnen Sie die **Einstellungen**.

2. Wechseln Sie zum Reiter **Launcher**.

3. Suchen Sie den Bereich **Anpassung**.

4. Öffnen Sie den Punkt **Benutzerdefiniertes Theme**.

5. Wählen Sie das gewünschte Theme aus.

Das Theme wird direkt nach der Auswahl angewendet.

Um zum Standarddesign von 16Launcher zurückzukehren, wählen Sie **Standard**.

Das ausgewählte Theme wird in den Launcher-Einstellungen gespeichert, sodass es nach jedem Start der Anwendung nicht erneut ausgewählt werden muss.

### Wie das Theme angewendet wird

Wenn der Benutzer ein Theme auswählt, speichert 16Launcher dessen ID oder Namen in den Benutzereinstellungen. Beim Start des Programms lädt es das aktive Theme erneut und wendet das CSS auf die Benutzeroberfläche an.

Wenn das Theme nach der Installation manuell im Ordner geändert wurde, wird der Effekt möglicherweise nicht sofort angezeigt, bis die Datei neu geladen oder das Theme neu erstellt/ausgewählt wird. Mehr dazu erfahren Sie weiter unten im Abschnitt zur CSS-Bearbeitung.

### Standard-Theme

Die Auswahl von **Standard** bedeutet in der Regel das Zurücksetzen auf das ursprüngliche Design des Launchers. Dabei wird der Theme-Ordner selbst nicht gelöscht, sondern einfach nicht mehr verwendet. Dies ist praktisch, wenn Sie das Aussehen schnell vergleichen möchten, ohne das erstellte Theme zu verlieren.

## 4. Theme installieren

Sie können ein Theme auf verschiedene Arten installieren.

### 4.1. ZIP-Archiv importieren

Der Import einer ZIP-Datei ist der einfachste Weg, ein fertiges Theme zu installieren.

Ablauf der Installation:

1. Öffnen Sie die Einstellungen für benutzerdefinierte Themes.

2. Klicken Sie auf **ZIP importieren**.

3. Wählen Sie das ZIP-Archiv mit dem Theme aus.

4. Warten Sie, bis der Import abgeschlossen ist.

5. Wählen Sie das installierte Theme aus der Liste aus.

Nach erfolgreichem Import erscheint das Theme im Verzeichnis `themes` und steht in der Theme-Liste zur Verfügung.

### Anforderungen an das ZIP-Archiv

Im Archiv müssen folgende Dateien enthalten sein:

```
theme.json
style.css

```

Die Dateien können sich direkt im Stammverzeichnis des Archivs befinden:

```
ocean-mint.zip
├── theme.json
└── style.css

```

Sie können sich auch innerhalb eines gemeinsamen Ordners befinden:

```
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    └── style.css

```

Beide Varianten werden unterstützt.

Bei Vorhandensein zusätzlicher Ressourcen kann die Struktur wie folgt aussehen:

```
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    ├── style.css
    ├── background.png
    └── fonts/
        └── MyFont.woff2

```

Für den Namen des ZIP-Archivs wird empfohlen, lateinische Buchstaben, Zahlen, Bindestriche und Unterstriche zu verwenden.

Zum Beispiel:

```
ocean-mint.zip
dark-glass.zip
baza-emerald.zip

```

### Bestimmung der ID beim Import

Beim Importieren einer ZIP-Datei wird die Theme-ID automatisch auf der Grundlage des ZIP-Dateinamens generiert, wobei unzulässige Zeichen bereinigt werden.

Zum Beispiel:

```
Ocean Mint.zip

```

kann folgende ID erhalten:

```
ocean-mint

```

Daher wird empfohlen, vorab einen korrekten Archivnamen zu verwenden.

Dies ist wichtig, da die Theme-ID häufig in Systempfaden, Ordnernamen und in der Logik der Theme-Auswahl verwendet wird. Wenn das Archiv einen ungeeigneten Namen hat, wird der Theme-Ordner möglicherweise mit einer unübersichtlichen ID erstellt. Dies erschwert später das Suchen, Löschen und Aktualisieren des Themes.

### Was nach dem Import passiert

Nach dem Import führt 16Launcher üblicherweise Folgendes aus:

* erstellt einen Theme-Ordner im Verzeichnis `themes`;

* kopiert die enthaltenen Dateien;

* erkennt `theme.json` und `style.css`;

* fügt das Theme zur Liste der verfügbaren Themes hinzu.

Wenn das Theme korrekt erkannt wurde, steht es sofort zur Auswahl bereit. Gibt es Probleme mit dem Archiv (z. B. fehlendes `style.css` oder beschädigtes JSON), wird das Theme möglicherweise nicht angezeigt oder fehlerhaft dargestellt.

## 5. Manuelle Installation eines Themes

Ein Theme kann auch ohne Nutzung des ZIP-Imports manuell installiert werden.

Dazu:

1. Erstellen Sie einen eigenen Ordner für das Theme.

2. Füge `theme.json` und `style.css` hinzu.

3. Fügen Sie bei Bedarf Bilder, Schriftarten und andere Ressourcen hinzu.

4. Kopieren Sie den Ordner in das Verzeichnis `themes`.

5. Öffnen Sie die Einstellungen von 16Launcher.

6. Wechseln Sie in den Bereich für benutzerdefinierte Themes.

7. Wählen Sie das installierte Theme aus.

Beispiel:

```
themes/
└── ocean-mint/
    ├── theme.json
    ├── style.css
    └── background.png

```

Wenn die Theme-Liste während des Kopierens der Dateien bereits geöffnet war, müssen Sie möglicherweise den Reiter **Launcher** erneut öffnen oder 16Launcher neu starten.

### Wann das manuelle Kopieren besser als der ZIP-Import ist

Die manuelle Methode ist nützlich, wenn:

* sich das Theme in der Entwicklung befindet;

* schnelle Änderungen ohne erneutes Packen vorgenommen werden sollen;

* Sie ein Theme für ein bestimmtes Projekt oder ein lokales Ressourcenset erstellen möchten;

* eine feine Einstellung der Dateien im Ordner erforderlich ist.

Der ZIP-Import eignet sich hingegen besser zum Weitergeben an andere Personen, da das gesamte Theme bequem in einer Datei zusammengefasst ist.

### Wichtigkeit der richtigen Ordnerstruktur

Die Dateien innerhalb des Themes dürfen nicht irgendwo liegen, sondern müssen sich in einem klar definierten Theme-Ordner befinden. Wenn Sie Dateien ohne Ordner direkt im Stammverzeichnis von `themes` ablegen, kann 16Launcher diese möglicherweise nicht erkennen. Das Gleiche gilt für zu tief verschachtelte Verzeichnisse.

Die Grundregel lautet: Jedes Theme ist ein eigener Ordner, und darin befinden sich `theme.json` und `style.css`.

## 6. Erstellen eines Themes aus 16Launcher heraus

16Launcher ermöglicht es, ein neues Theme direkt aus den Einstellungen heraus zu erstellen.

Vorgehensweise:

1. Öffnen Sie **Einstellungen → Launcher → Benutzerdefiniertes Theme**.

2. Klicken Sie auf **Theme erstellen**.

3. Geben Sie den Namen des Themes ein.

4. 16Launcher erstellt den Ordner für das Theme.

5. Im Ordner werden die Standarddateien `theme.json` und `style.css` angelegt.

6. Klicken Sie auf **CSS bearbeiten**, um `style.css` in einem externen Editor zu öffnen.

7. Nehmen Sie die gewünschten Änderungen vor.

8. Speichern Sie die Datei.

Nachdem Sie das CSS geändert haben, wechseln Sie das Theme oder wählen Sie es erneut aus, um die Änderungen anzuwenden.

### Wie das Theme erstellt wird

Beim Erstellen eines Themes generiert 16Launcher selbst einen Ordner mit einem Namen, der vom angegebenen Titel abgeleitet ist, und erstellt die Basisdateien. Dies ist praktisch, weil:

* keine manuelle Ordnerstruktur erstellt werden muss;

* sofort eine Vorlage für den Start bereitsteht;

* Ideen schnell getestet werden können;

* das Theme leicht gespeichert und später als ZIP gepackt werden kann.

### Was nach dem Speichern der CSS-Datei zu tun ist

Nach dem Bearbeiten der Datei erwarten viele Benutzer, dass die Änderungen sofort angewendet werden. In der aktuellen Version von 16Launcher geschieht dies jedoch nicht immer automatisch. Daher muss man verstehen, dass der CSS-Editor kein Live-Preview-Dienst ist.

### Aktualisieren des Themes nach CSS-Änderungen

In der aktuellen Version von 16Launcher gibt es keine automatische Echtzeit-Überwachung von Änderungen an `style.css`.

Nach dem Bearbeiten der Datei müssen Sie daher:

* zu einem anderen Theme und zurück wechseln;

* oder den Launcher neu starten.

Dies ist während der Entwicklung besonders wichtig, da das reine Speichern der Datei im Texteditor keine sofortige Aktualisierung der Benutzeroberfläche garantiert.

Wenn ein Theme aktiv ist, lädt 16Launcher das CSS genau einmal. Wenn sich die Datei ändert, erkennt die Anwendung nicht automatisch, dass die Stile neu geladen werden müssen. Merken Sie sich daher diesen Ablauf:

1. CSS bearbeiten;

2. Datei speichern;

3. Theme wechseln oder Anwendung neu starten;

4. Ergebnis überprüfen.

### Empfohlene Vorgehensweise bei der Entwicklung

In der Anfangsphase empfiehlt es sich:

* kleine Änderungen vorzunehmen;

* das Ergebnis nach jedem Speichern zu überprüfen;

* jeweils einen Stil anzupassen;

* eine minimale Anzahl an Selektoren zu verwenden;

* abrupte globale Überschreibungen zu vermeiden, die das Layout beschädigen könnten.

## 7. Kennung (ID) und angezeigter Name des Themes

Jedes Theme besitzt zwei verschiedene Namen:

1. **Theme-ID** — der technische Name des Ordners;

2. **Theme-Name** — der dem Benutzer angezeigte Name.

Diese Werte werden für unterschiedliche Zwecke verwendet und dürfen nicht als identisch betrachtet werden.

### 7.1. Theme-ID

Die ID ist der Name des Theme-Ordners auf der Festplatte.

Zum Beispiel:

```
ocean-mint/

```

wobei `ocean-mint` die Theme-ID ist.

Empfohlene Regeln:

* lateinische Buchstaben verwenden;

* bei Bedarf Zahlen verwenden;

* `-` und `_` verwenden;

* keine Leerzeichen verwenden;

* keine Sonderzeichen verwenden;

* vorzugsweise Kleinschreibung verwenden;

* einen kurzen und prägnanten Namen wählen.

Empfohlene Beispiele:

```
ocean-mint
dark-glass
baza-emerald
my-theme
theme_01

```

Unerwünschte Beispiele:

```
Mein Theme!!!
theme 1
Cool Theme (final)
neues-theme-1

```

Beim Erstellen eines Themes über die Schaltfläche **Theme erstellen** generiert 16Launcher automatisch eine ID auf Basis des eingegebenen Namens.

Zum Beispiel:

```
Ocean Mint

```

wird umgewandelt in:

```
ocean-mint

```

Beim ZIP-Import wird die Kennung aus dem Namen des ZIP-Archivs gebildet.

### 7.2. Angezeigter Name

Der angezeigte Name wird im Feld `name` der Datei `theme.json` festgelegt.

Im Gegensatz zur ID ist dieser Name direkt für den Endanwender bestimmt.

Hier können Sie Folgendes verwenden:

* Sonderzeichen und andere Alphabete (z. B. Umlaute);

* Leerzeichen;

* Großbuchstaben;

* Sonderzeichen;

* alle weiteren von UTF-8 unterstützten Zeichen.

Zum Beispiel:

```
{
  "name": "Smaragd-Ozean",
  "author": "BAZA",
  "description": "Grün-türkises Theme für 16Launcher",
  "version": "1.0"
}

```

In diesem Fall:

* kann die Theme-ID `ocean-mint` lauten;

* ist der angezeigte Name `Smaragd-Ozean`.

### Warum die Unterscheidung zwischen ID und Name wichtig ist

Dies ist besonders wichtig beim Veröffentlichen von Themes, beim Austausch unter Benutzern und bei der späteren Pflege. Der Ordner auf der Festplatte sollte für das System optimal benannt sein, während der angezeigte Name für Menschen verständlich sein sollte.

Ein Ordner namens `dark-glass` kann auf der Festplatte so heißen, aber in der Benutzeroberfläche kann dem Benutzer **Gläserne Dunkelheit**, **Dunkles Glas** oder **Midnight Glass** angezeigt werden. Dies macht das Theme ansprechender, ohne die technische Struktur zu beeinträchtigen.

## 8. Format von `theme.json`

Die Datei `theme.json` enthält die Metadaten des Themes.

Minimales Beispiel:

```
{
  "name": "Mein Theme",
  "author": "Ihr Name",
  "description": "Kurze Beschreibung des Themes",
  "version": "1.0"
}

```

Unterstützte Felder:

| Feld | Zweck | 
 | ----- | ----- | 
| `name` | Name des Themes in der Benutzeroberfläche | 
| `author` | Autor des Themes | 
| `description` | Kurze Beschreibung | 
| `version` | Version des Themes | 

Alle Felder sind optional. Es wird jedoch empfohlen, mindestens `name`, `author`, `description` und `version` anzugeben, insbesondere wenn das Theme weitergegeben werden soll.

Wenn `name` nicht angegeben oder leer ist, kann die Benutzeroberfläche den Ordnernamen des Themes verwenden.

### Was sind Theme-Metadaten?

Die Datei `theme.json` dient nicht nur der ansprechenden Anzeige. Sie fungiert auch als Beschreibung des Themes für die Benutzeroberfläche, zur Identifikation und zur bequemen Verwaltung. Wenn ein Theme weitergegeben wird, ist es hilfreich, wenn jedes Archiv klare Metadaten enthält: Name, Autor, Version und Kurzbeschreibung.

### Theme-Version

Für die Version empfiehlt sich ein englisches/semantisches Standardformat:

```
1.0

```

oder:

```
1.2.0

```

Bei größeren Änderungen am Theme sollte die Versionsnummer erhöht werden, damit Benutzer neue Versionen leicht von älteren unterscheiden können.

Dies ist besonders wichtig, wenn das Theme von mehreren Benutzern heruntergeladen, aktualisiert oder geteilt wird. Ein einheitliches Versionsformat ermöglicht es, Änderungen besser zu verfolgen und die Kompatibilität mit der aktuellen Launcher-Version zu prüfen.

### Dateikodierung

`theme.json` muss zwingend in der Kodierung **UTF-8** gespeichert werden.

Bei der Verwendung von Sonderzeichen oder Umlauten ist dies absolut essenziell. Eine falsche Dateikodierung kann dazu führen, dass Name, Autor oder Beschreibung fehlerhaft dargestellt werden.

Probleme mit UTF-8 entstehen häufig, wenn die Datei in ANSI, UTF-16 oder einer anderen Kodierung gespeichert wird. Das Resultat können sein:

* Ersetzung von Zeichen durch Fragezeichen oder Symbole;

* unleserliche Zeichenketten;

* fehlerhafte Namen;

* Fehler beim Laden des Themes.

Stellen Sie daher vor dem Veröffentlichen eines Themes immer sicher, dass die Datei als UTF-8 gespeichert ist.

## 9. Format von `style.css`

Die hauptsächliche Anpassung des Erscheinungsbilds erfolgt in der Datei `style.css`.

Es handelt sich um eine gewöhnliche CSS-Datei. Daher können Sie zur Erstellung eines Themes Standard-CSS-Eigenschaften, Selektoren, Variablen, Farbverläufe, Bilder, Schriftarten und andere CSS-Funktionen verwenden, die von 16Launcher unterstützt werden.

Einfaches Beispiel:

```
:root {
  --accent-color: #10b981;
}

.glass-panel {
  background: rgba(6, 40, 30, 0.75) !important;
}

.accent-bg {
  background: linear-gradient(135deg, #34d399, #059669) !important;
}

.interactive-press {
  border-radius: 16px !important;
}

.sidebar-icon-active {
  color: #6ee7b7 !important;
}

```

### Warum das Theme-CSS `style.css` heißen muss

Weil 16Launcher genau diese Datei als Hauptquelle für benutzerdefinierte Stile erwartet. Darin werden die Regeln definiert, die das Standarddesign überschreiben.

### CSS im Theme verstehen

Im Theme können Sie Folgendes verwenden:

* Klassen-Selektoren;

* CSS-Variablen;

* Pseudoklassen;

* `background`, `color`, `border`, `border-radius`, `opacity`, `box-shadow`;

* `url(...)` für Bilder;

* `@font-face` für benutzerdefinierte Schriftarten.

Wichtig ist jedoch zu beachten, dass 16Launcher eigene Klassen mit höherer Priorität verwenden kann. Daher benötigen einige Werte möglicherweise ein `!important`, um korrekt angewendet zu werden.

### Verwendung von `!important`

Die Standardstile von 16Launcher haben möglicherweise eine höhere Priorität als die Regeln des benutzerdefinierten Themes.

In solchen Fällen kann `!important` erforderlich sein.

Beispiel:

```
.glass-panel {
  background: rgba(6, 40, 30, 0.75) !important;
}

```

Verwenden Sie `!important` nicht ohne Notwendigkeit für alle Eigenschaften. Prüfen Sie zuerst, ob die normale CSS-Regel bereits greift.

Zu viele `!important`-Angaben können:

* den Code schwer wartbar machen;

* spätere Anpassungen erschweren;

* zu Konflikten bei App-Updates führen;

* unbeabsichtigt falsche Elemente überschreiben.

Nutzen Sie `!important` daher gezielt nur dort, wo tatsächlich ein Prioritätskonflikt vorliegt.

## 10. Hauptselektoren von 16Launcher

In Themes können folgende Klassen und CSS-Variablen verwendet werden:

| Selektor | Zweck | 
 | ----- | ----- | 
| `.glass-panel` | Haupt-Glaspanels der Benutzeroberfläche | 
| `.glass-chip` | Kleine Chips und Badges | 
| `.interactive-press` | Klickbare Elemente und Schaltflächen | 
| `.accent-bg` | Akzent-Hintergrund, einschließlich einiger Buttons | 
| `.accent-border` | Akzent-Rahmen | 
| `.accent-chip` | Akzent-Chips | 
| `.sidebar-icon-active` | Aktives Symbol in der Seitenleiste | 
| `:root` | Wurzelelement zur Definition von CSS-Variablen | 
| `--accent-color` | Hauptakzentfarbe | 

Die Menge der verfügbaren Klassen kann sich im Zuge der Weiterentwicklung von 16Launcher ändern. Daher empfiehlt es sich bei komplexen Themes, deren Funktion nach einem Launcher-Update zu überprüfen.

### Arbeiten mit Selektoren

Wenn ein Theme den allgemeinen Hintergrund von Panels ändern soll, eignet sich `.glass-panel`. Um Schaltflächen hervorzuheben, reichen meist `.interactive-press` oder `.accent-bg`. Zur Gestaltung von Icons und aktiven Elementen der Seitenleiste nutzen Sie `.sidebar-icon-active`.

### Was tun, wenn eine Klasse fehlt?

Wenn eine bestimmte Klasse fehlt, können allgemeinere Selektoren verwendet werden. Bedenken Sie jedoch, dass globale Regeln versehentlich auch Elemente betreffen können, die Sie gar nicht ändern wollten.

Sie können beispielsweise die Farbe aller Buttons ändern, aber das könnte sich auf verschiedene Teile der Benutzeroberfläche auswirken. Für ein sauberes Theme empfiehlt es sich daher:

* spezifische Klassen zu verwenden;

* Selektoren zu kombinieren;

* das visuelle Ergebnis genau zu prüfen;

* ein pauschales Umfärben der gesamten App zu vermeiden.

### CSS-Variablen

Variablen werden über `:root` angewendet:

```
:root {
  --accent-color: #10b981;
}

```

Dies ist sehr praktisch, weil:

* Farben an einer zentralen Stelle geändert werden können;

* nicht Dutzende Regeln umgeschrieben werden müssen;

* das Theme einfacher zu pflegen ist;

* Farbvarianten leichter erstellt werden können.

Beachten Sie jedoch, dass nicht alle Elemente in 16Launcher ausschließlich auf einer einzigen Variable basieren. Manche Oberflächenelemente greifen direkt auf Klassen und andere auf eigene Variablen zu.

## 11. Verwendung von Bildern

Sie können eigene Bilder in den Theme-Ordner einbinden.

Beispiel:

```
ocean-mint/
├── theme.json
├── style.css
└── background.png

```

Anschließend kann das Bild in `style.css` verknüpft werden:

```
.glass-panel {
  background-image: url(background.png) !important;
  background-size: cover !important;
}

```

Der Pfad zur Ressource muss **relativ** sein.

Befindet sich das Bild in einem Unterordner:

```
ocean-mint/
├── theme.json
├── style.css
└── images/
    └── background.png

```

nutzen Sie:

```
.glass-panel {
  background-image: url(images/background.png) !important;
}

```

16Launcher verarbeitet relative `url(...)`-Pfade und wandelt sie in funktionierende Pfade zu den Theme-Ressourcen um.

### Warum absolute Pfade nicht verwendet werden dürfen

Verwenden Sie für lokale Theme-Dateien niemals absolute Pfade eines bestimmten Computers, wie z. B.:

```
C:\Users\User\Desktop\background.png

```

Solche Pfade funktionieren nicht mehr, sobald das Theme an einen anderen Benutzer weitergegeben wird.

Absolute Pfade:

* sind an ein bestimmtes Gerät gebunden;

* hängen vom Systembenutzernamen ab;

* hängen von der lokalen Ordnerstruktur ab;

* lassen sich nicht auf andere Computer übertragen;

* zerstören die Portabilität des Themes.

### Was bei Bildern zu beachten ist

Bei der Verwendung von Hintergrundbildern sollte man beachten:

* Die Dateigröße sollte nicht zu groß sein;

* Für eine skalierbare Oberfläche empfiehlt sich eine passende Auflösung;

* Mit `background-size: cover` lässt sich die Fläche optimal ausfüllen;

* Hintergrundbilder sollten stilistisch zum Gesamtthema passen;

* Bildmotive hinter aktiven Elementen sollten nicht zu unruhig sein.

Oft ist eine Kombination aus:

* halbtransparentem Hintergrund;

* sanftem Farbverlauf;

* dezentem Muster oder Textur;
  besser als ein zu schweres Bild, das unnötig Ressourcen verbraucht.

## 12. Verwendung benutzerdefinierter Schriftarten

Sie können eigene Schriftdateien im Theme-Ordner ablegen.

Beispiel:

```
ocean-mint/
├── theme.json
├── style.css
└── fonts/
    └── MyFont.woff2

```

Eine Schriftart kann über `@font-face` eingebunden werden:

```
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}

```

Stellen Sie vor der Weitergabe des Themes sicher, dass die Lizenz der verwendeten Schriftart die Weiterverbreitung erlaubt.

### Warum die Lizenzierung wichtig ist

Schriftarten verhelfen Themes oft zu einem einzigartigen Design, aber nicht alle dürfen frei verbreitet werden. Wenn eine Schriftart kommerziell eingeschränkt ist oder die Weitergabe in Archiven verbietet, kann dies zu rechtlichen Problemen führen.

Empfehlungen:

* Nutzen Sie frei verbreitbare Schriftarten (z. B. Google Fonts, OFL);

* Legen Sie die Lizenz im Archiv bei, falls erforderlich;

* Verwenden Sie keine fremden Ressourcen ohne Erlaubnis;

* Prüfen Sie die Weitergaberechte im Voraus.

### Wann eigene Schriftarten sinnvoll sind

Benutzerdefinierte Schriftarten funktionieren besonders gut, wenn das Theme:

* einen bestimmten Stil nachbilden soll;

* ein stark dekoratives Design aufweist;

* über auffällige Überschriften oder eine besondere visuelle Sprache verfügt.

Gute Gestaltung leidet jedoch, wenn die Schriftart schwer lesbar ist. Halten Sie daher die Waage zwischen Dekoration und Funktionalität.

## 13. Empfehlungen für die Erstellung von Themes

Bei der Entwicklung eines Themes empfiehlt es sich, folgende Regeln zu beachten:

### Verwenden Sie CSS-Variablen

Wenn ein Theme dieselbe Farbe an mehreren Stellen nutzt, definieren Sie diese zentral:

```
:root {
  --accent-color: #10b981;
}

```

Dies vereinfacht spätere Anpassungen des Farbschemas erheblich.

Vorteile von Variablen:

* Eine Farbänderung aktualisiert automatisch alle verknüpften Elemente;

* Farbvarianten lassen sich schneller erstellen;

* Das Farbschema bleibt konsistent;

* Der Code bleibt übersichtlich.

### Ändern Sie keine Systemdateien von 16Launcher

Alle Änderungen müssen ausschließlich im eigenen Theme-Ordner verbleiben.

Verändern Sie niemals Dateien der Hauptanwendung, um visuelle Anpassungen zu erreichen.

Dies ist aus zwei Gründen wichtig:

1. Änderungen an Systemdateien gehen bei einem Launcher-Update verloren;

2. Solche Eingriffe können die Stabilität der Anwendung gefährden.

Das Theme muss vom Hauptcode isoliert in einem separaten Ordner liegen, den 16Launcher kennt und unterstützt.

### Verwenden Sie relative Pfade

Nutzen Sie für Bilder und Schriftarten stets relative Pfade:

```
url(images/background.png)

```

Verzichten Sie komplett auf lokale absolute Pfade. Nur so bleibt das Theme übertragbar und lässt sich auf anderen Geräten problemlos laden.

### Testen Sie das Theme nach der Installation

Vor dem Weitergeben sollten Sie Folgendes prüfen:

* Darstellung aller Panels;

* Erscheinungsbild der Schaltflächen;

* Aktive Elemente;

* Hintergrundbilder;

* Einbindung der Schriftarten;

* Funktion nach einem Neustart des Launchers;

* Vollständigkeit des ZIP-Archivs.

Achten Sie nicht nur darauf, ob die CSS-Datei geladen wird, sondern auch darauf, ob die gesamte Benutzeroberfläche gut lesbar und stimmig bleibt.

### Starten Sie nicht zu komplex

Der häufigste Fehler von Einsteigern ist der Versuch, sofort ein hochkomplexes Design mit vielen Effekten, Schatten und Animationen umzusetzen. Dies führt oft zu:

* schwieriger Fehlersuche;

* CSS-Konflikten;

* schlechter Lesbarkeit der Oberfläche;

* Problemen nach Launcher-Updates.

Fangen Sie klein an:

1. Ändern Sie die Hauptakzentfarbe;

2. Passen Sie Hintergründe an;

3. Stellen Sie gute Lesbarkeit sicher;

4. Fügt danach schrittweise Details hinzu.

## 14. Theme teilen und weitergeben

Um ein Theme weiterzugeben, wird empfohlen, es in ein ZIP-Archiv zu packen.

Vorgehensweise:

1. Öffnen Sie das Theme-Verzeichnis.

2. Stellen Sie sicher, dass `theme.json` und `style.css` vorhanden sind.

3. Überprüfen Sie optionale Bilder und Schriftarten.

4. Erstellen Sie das ZIP-Archiv.

5. Senden Sie das Archiv an andere Benutzer.

Sie können den Theme-Ordner direkt archivieren:

```
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    ├── style.css
    └── background.png

```

Ebenso zulässig ist ein Archiv, das die Dateien direkt im Stammverzeichnis enthält:

```
ocean-mint.zip
├── theme.json
└── style.css

```

Es wird empfohlen, die Theme-ID als Namen für das ZIP-Archiv zu verwenden:

```
ocean-mint.zip

```

Dies erleichtert die Identifizierung und sorgt beim Importieren für eine saubere ID-Generierung.

Empfänger können das Theme wie folgt installieren:

**Einstellungen → Launcher → Benutzerdefiniertes Theme → ZIP importieren**

### Warum das Packen als ZIP wichtig ist

Das ZIP-Archiv ist der universelle Standard zur Weitergabe. Es:

* bündelt alle Dateien in einer einzelnen Datei;

* lässt sich bequem per E-Mail, Chat oder Forum versenden;

* bewahrt die Ordnerstruktur;

* vereinfacht die Installation ohne manuelles Kopieren.

### Empfehlungen zum Packen

Vor dem Versenden sollten Sie:

* prüfen, ob sich keine unnötigen Dateien im Archiv befinden;

* sicherstellen, dass alle Pfade relativ sind;

* sicherstellen, dass keine temporären Systemdateien enthalten sind;

* den Namen der ZIP-Datei prüfen;

* kontrollieren, ob `theme.json` und `style.css` an der richtigen Stelle liegen.

## 15. Theme löschen

Sie können ein installiertes Theme direkt aus der Benutzeroberfläche von 16Launcher löschen.

1. Öffnen Sie die Liste der benutzerdefinierten Themes.

2. Wählen Sie das Theme aus.

3. Klicken Sie auf **Theme löschen**.

4. Bestätigen Sie den Löschvorgang.

Alternativ können Sie den Theme-Ordner auch manuell aus dem Verzeichnis `themes` entfernen.

### Wann das manuelle Löschen nützlich ist

Das manuelle Löschen ist praktisch, wenn:

* das Theme-Verzeichnis schnell aufgeräumt werden soll;

* ein Theme nicht mehr benötigt wird;

* ein Problem mit einem beschädigten Ordner behoben werden muss;

* Reste von Themes entfernt werden sollen, die nicht mehr in der Oberfläche erscheinen.

Stellen Sie beim manuellen Löschen sicher, dass:

* der Ordner wirklich nicht mehr gebraucht wird;

* das Theme aktuell nicht als aktiv ausgewählt ist;

* Sie nach dem Löschen ggf. ein neues Theme in der App wählen.

### Mitgelieferte (integrierte) Themes

Einige Themes, die zusammen mit 16Launcher ausgeliefert werden, können beim nächsten Start der Anwendung automatisch wiederhergestellt werden.

Wenn Sie beispielsweise das mitgelieferte Theme `example-theme` löschen, kann der Launcher dieses aus seinen internen Ressourcen erneut kopieren, wenn er feststellt, dass der Ordner fehlt.

Beachten Sie daher den Unterschied zwischen:

* manuell installierten Benutzer-Themes (dauerhaft löschbar);

* mitgelieferten Themes (die sich evtl. automatisch wiederherstellen).

## 16. Typische Probleme

### Theme erscheint nicht in der Liste

Überprüfen Sie Folgendes:

* Existiert der Theme-Ordner?

* Ist `theme.json` vorhanden?

* Ist `style.css` vorhanden?

* Liegen diese Dateien direkt im Theme-Ordner?

* Ist die JSON-Datei korrekt formatiert?

* Befindet sich der Ordner im richtigen Verzeichnis `themes`?

Korrektes Beispiel:

```
themes/
└── my-theme/
    ├── theme.json
    └── style.css

```

Fehlen Dateien, kann die Anwendung das Theme nicht erkennen. Prüfen Sie in diesem Fall die Ordnerstruktur sorgfältig.

### Nach dem Import entstand eine falsche ID

Beim Importieren einer ZIP-Datei wird die ID aus dem Namen des Archivs abgeleitet.

Zum Beispiel:

```
Mein Cooles Theme.zip

```

kann eine ungewünschte ID erzeugen.

Wenn Sie die ID ändern möchten, benennen Sie das ZIP-Archiv vor dem Import um oder installieren Sie das Theme manuell.

### CSS wird nicht angewendet

Mögliche Ursachen:

1. Syntaxfehler im CSS-Selektor.

2. Standardregel hat eine höhere Priorität.

3. `!important` fehlt an einer notwendigen Stelle.

4. Theme wurde nach der Dateiänderung nicht neu angewendet.

5. Änderungen wurden im Editor nicht gespeichert.

Wechseln Sie nach dem Bearbeiten von `style.css` das Theme oder starten Sie 16Launcher neu.

### Bild wird nicht angezeigt

Überprüfen Sie:

* Existiert die Bilddatei?

* Ist der relative Pfad richtig geschrieben?

* Stimmt die Groß-/Kleinschreibung des Dateinamens überein?

* Liegt die Datei innerhalb des Theme-Ordners?

Beispiel:

```
background-image: url(images/background.png);

```

erfordert die Datei unter:

```
images/background.png

```

Beachten Sie, dass Dateinamen auf einigen Betriebssystemen (wie Linux) auf Groß-/Kleinschreibung achten. Heißt die Datei `Background.png` und im CSS steht `background.png`, schlägt das Laden fehl.

### Theme ist nach dem Zurücksetzen der Einstellungen verschwunden

Das Zurücksetzen der Einstellungen setzt die Auswahl des aktiven Themes zurück.

Der Theme-Ordner im Verzeichnis `themes` bleibt dabei auf der Festplatte erhalten.

Öffnen Sie in diesem Fall einfach die Liste der benutzerdefinierten Themes und wählen Sie Ihr Theme erneut aus.

## 17. Empfohlene Struktur eines fertigen Themes

Für die Weitergabe wird folgende Struktur empfohlen:

```
ocean-mint/
├── theme.json
├── style.css
├── images/
│   └── background.png
└── fonts/
    └── MyFont.woff2

```

Beispiel `theme.json`:

```
{
  "name": "Smaragd-Ozean",
  "author": "BAZA",
  "description": "Grün-türkises Theme für 16Launcher",
  "version": "1.0.0"
}

```

Beispiel `style.css`:

```
:root {
  --accent-color: #10b981;
}

.glass-panel {
  background: rgba(6, 40, 30, 0.75) !important;
  border-color: rgba(16, 185, 129, 0.35) !important;
}

.accent-bg {
  background: linear-gradient(135deg, #34d399, #059669) !important;
}

.accent-border {
  border-color: rgba(16, 185, 129, 0.5) !important;
}

.interactive-press {
  border-radius: 16px !important;
}

.sidebar-icon-active {
  color: #6ee7b7 !important;
}

```

### Warum diese Struktur empfohlen wird

Diese Struktur ist:

* logisch aufgebaut;

* leicht verständlich;

* einfach zu teilen;

* übersichtlich zu bearbeiten;

* trennt verschiedene Ressourcentypen sauber voneinander;

* entspricht gängigen Standards für Theme-Pakete.

## 18. Checkliste vor der Veröffentlichung

Bevor Sie Ihr Theme an andere Benutzer weitergeben, sollten Sie folgende Punkte prüfen:

* \[ \] Theme-Ordner hat eine saubere ID, z. B. `my-theme`.

* \[ \] `theme.json` ist im Ordner vorhanden.

* \[ \] `style.css` ist im Ordner vorhanden.

* \[ \] `theme.json` ist in UTF-8 kodiert.

* \[ \] `theme.json` enthält einen verständlichen Namen.

* \[ \] Autor ist angegeben.

* \[ \] Version ist angegeben.

* \[ \] Kurze Beschreibung ist vorhanden.

* \[ \] Alle Bilder und Schriftarten befinden sich innerhalb des Theme-Ordners.

* \[ \] Im CSS werden relative Pfade verwendet.

* \[ \] Das Theme wird in 16Launcher korrekt dargestellt.

* \[ \] Alle gewünschten CSS-Regeln greifen.

* \[ \] Das Theme funktioniert auch nach einem Neustart des Launchers tadellos.

* \[ \] Das ZIP-Archiv lässt sich problemlos über **ZIP importieren** installieren.

* \[ \] Keine unnötigen temporären Dateien befinden sich im Archiv.

## 19. Schnellstart

Erstellen Sie Ihr erstes Theme in wenigen Minuten.

### Schritt 1. Theme erstellen

Öffnen Sie:

**Einstellungen → Launcher → Benutzerdefiniertes Theme → Theme erstellen**

Geben Sie einen Namen ein, zum Beispiel:

```
Mein Theme

```

16Launcher erstellt den Ordner und die notwendigen Dateien.

### Schritt 2. CSS öffnen

Klicken Sie auf **CSS bearbeiten**.

Es öffnet sich die Datei:

```
style.css

```

### Schritt 3. Stile hinzufügen

Fügen Sie Stile hinzu:

```
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

Speichern Sie die Datei.

### Schritt 4. Änderungen anwenden

Wechseln Sie das Theme auf **Standard** und wählen Sie danach Ihr neu erstelltes Theme erneut aus (oder starten Sie 16Launcher neu).

Die CSS-Änderungen sollten nun sichtbar sein.

### Schritt 5. Theme zum Teilen vorbereiten

Wenn das Design fertig ist, packen Sie den Theme-Ordner in ein ZIP-Archiv:

```
my-theme.zip
└── my-theme/
    ├── theme.json
    └── style.css

```

Das fertige Archiv kann nun an andere Personen weitergegeben werden.

## 20. Beispiel-Themes

16Launcher kann Beispiel- und Test-Themes enthalten.

Zum Beispiel:

* `example-theme` — lila Demonstrations-Theme;

* `baza-emerald` — Smaragd-Test-Theme.

Diese Themes können als Orientierungshilfe für Struktur und Gestaltung eigener Themes dienen.
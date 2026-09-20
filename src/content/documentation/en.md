# 16Launcher Custom Themes

Custom themes allow you to modify the appearance of the 16Launcher interface using CSS. A theme can change colors, backgrounds, corner radii, borders, accent elements, and other visual properties of the interface.

This article describes how to install, create, configure, remove, and distribute themes for 16Launcher. Additionally, it covers where themes are stored, how their files are structured, what fields are used in metadata, how to link images and fonts, and what common mistakes occur and how to avoid them.

## 1. What is a Theme

A 16Launcher theme is a separate folder containing two required files:

| File | Purpose |
| --- | --- |
| `theme.json` | Theme metadata: title, author, description, and version |
| `style.css` | CSS styles modifying the visual appearance of the interface |

Additionally, you can place images, fonts, and other assets required for the styling inside the theme folder.

Example theme structure:

```text
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2
```

Files, additional assets, and the inner structure of the folder may vary depending on the theme's purpose. However, `theme.json` and `style.css` must always be present.

It is important to understand that a theme does not replace the entire 16Launcher interface. It is applied on top of the application's default layout and modifies it using CSS rules. This means the user does not alter the logical structure of the launcher, but merely recolors or enhances the standard interface visually.

For example, a theme can:
* Change the primary accent color;
* Modify panel color and opacity;
* Customize button appearance;
* Adjust element corner rounding;
* Change the styling of active sidebar items;
* Add background images;
* Connect custom fonts.

This allows for both minor visual tweaks and completely redesigned interface color schemes. Within the same application, you can use different themes for different moods: minimalist, dark, light, glass, gaming, high contrast, etc.

### How a Custom Theme Works

A custom theme in 16Launcher works on the principle of CSS overriding. The launcher already contains a base structure and styles, and the theme simply overrides specific selectors, classes, and CSS variables.

In practice, this means a theme can:
* Change the primary accent color;
* Override object backgrounds;
* Modify shadows, borders, and radii;
* Make specific panels translucent;
* Change text and icon colors;
* Set alternative backgrounds, gradients, and special effects.

However, you cannot "rewrite" the entire interface layout, as 16Launcher still builds UI elements according to its own framework. The theme must operate within the app's existing components rather than manually replacing them.

### Why a Theme Is Not Just a CSS File

The `style.css` file alone is not a standalone "script." It must account for the fact that 16Launcher uses its own set of classes, variables, and element hierarchy. For this reason, a theme is almost always built around existing CSS classes and variables rather than arbitrary custom selectors.

Therefore, when developing a theme, it is essential to understand:
* Which classes are used in the interface;
* Which properties can be overridden;
* Which parts of the UI are best left untouched;
* How to ensure compatibility with launcher updates.

---

## 2. Location of Themes

After installing 16Launcher, themes are stored in a dedicated `themes` directory.

The location of this directory depends on the operating system.

| Operating System | Themes Directory |
| --- | --- |
| Windows | `%APPDATA%\16Launcher\themes\` |
| Linux | `~/.local/share/16Launcher/themes/` |
| macOS | `~/Library/Application Support/16Launcher/themes/` |

### Windows

On Windows, the directory is typically located at:

```text
C:\Users\<Username>\AppData\Roaming\16Launcher\themes\
```

Replace `<Username>` with your current Windows user account name.

### Linux

On Linux, the themes folder is usually located in the user directory:

```text
~/.local/share/16Launcher/themes/
```

This is the standard location for user application data and is writable without requiring elevated privileges.

### macOS

On macOS, themes are usually stored in:

```text
~/Library/Application Support/16Launcher/themes/
```

This also uses the application user data directory, avoiding conflicts with system files.

### Directory Structure

Each theme must reside in its own separate folder:

```text
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

Do not place multiple themes into a single folder. Every theme must have its own directory.

### How to Open the Themes Directory

You can open the themes directory directly from the launcher interface:

**Settings → Launcher → Custom Theme → Open Themes Folder**

This method is recommended whenever you need to manually install, edit, or delete a theme.

It is convenient because:
* You don't need to look up the path manually;
* Eliminates the risk of choosing the wrong directory;
* Allows you to quickly open a target theme for editing;
* Makes managing multiple installed themes easier.

### Important Note Regarding Theme Folders

Theme files must be placed directly inside their respective theme folder, not in the root of the `themes` directory or nested inside unnecessary subfolders. When 16Launcher scans for themes, each theme must be represented by an individual folder with a valid internal structure.

---

## 3. How to Enable a Theme

Once installed, the theme will appear in the list of available themes.

To enable a theme:

1. Open **Settings**.
2. Go to the **Launcher** tab.
3. Find the **Customization** section.
4. Open the **Custom Theme** dropdown/menu.
5. Select the desired theme.

The theme applies immediately upon selection.

To revert to the standard 16Launcher look, select **Default**.

The selected theme is saved in the launcher's settings, so you do not need to reselect it every time you open the app.

### How Theme Application Works

When a user selects a theme, 16Launcher saves its ID or name to user preferences. When the application launches, it reloads the active theme and applies its CSS to the interface.

If a theme is modified manually in its folder while the app is running, changes may not take effect immediately until the file is reloaded or the theme is re-selected/re-applied. More details on this can be found in the CSS editing section below.

### Default Theme

Selecting the **Default** option reverts the launcher to its original layout and style. The theme folder itself is not deleted; it simply stops being active. This is convenient when you want to quickly compare styling without losing your custom work.

---

## 4. Installing a Theme

You can install a theme in a few different ways.

### 4.1. Importing a ZIP Archive

ZIP import is the easiest way to install a pre-packaged theme.

Installation steps:

1. Open custom theme settings.
2. Click **Import ZIP**.
3. Select the ZIP archive containing the theme.
4. Wait for the import to complete.
5. Select the installed theme from the list.

After a successful import, the theme appears in the `themes` directory and becomes selectable in the theme list.

### Requirements for ZIP Archives

The archive must contain:

```text
theme.json
style.css
```

Files can be located directly in the root of the archive:

```text
ocean-mint.zip
├── theme.json
└── style.css
```

Or enclosed within a single top-level folder:

```text
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    └── style.css
```

Both structure variants are supported.

When additional assets are included, the layout might look like this:

```text
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    ├── style.css
    ├── background.png
    └── fonts/
        └── MyFont.woff2
```

It is recommended to use Latin characters, numbers, hyphens, and underscores for the ZIP archive file name.

For example:

```text
ocean-mint.zip
dark-glass.zip
baza-emerald.zip
```

### ID Generation on Import

When importing a ZIP archive, the theme ID is automatically generated from the ZIP file name, stripping out invalid characters.

For example:

```text
Ocean Mint.zip
```

might yield the ID:

```text
ocean-mint
```

Therefore, naming your archive appropriately beforehand is recommended.

This matters because the theme ID is frequently used in system file paths, folder names, and theme selection logic. If the archive has an awkward name, the resulting folder ID might be non-obvious or inconvenient, making it harder to locate, remove, or update later.

### What Happens After Import

Upon importing, 16Launcher typically:
* Creates a new folder in the `themes` directory;
* Copies the contents into it;
* Parses `theme.json` and `style.css`;
* Adds the theme to the list of available choices.

If the theme is parsed correctly, it becomes selectable immediately. If there are issues (e.g., missing `style.css` or corrupt JSON), the theme may fail to appear or display incorrectly.

---

## 5. Installing a Theme Manually

You can also install a theme manually without using the ZIP import option.

To do so:

1. Create a dedicated folder for your theme.
2. Add `theme.json` and `style.css` to it.
3. Add images, fonts, or other assets if necessary.
4. Copy the folder into the `themes` directory.
5. Open 16Launcher settings.
6. Navigate to the custom theme section.
7. Select the installed theme.

For example:

```text
themes/
└── ocean-mint/
    ├── theme.json
    ├── style.css
    └── background.png
```

If the settings UI was already open when copying files, you may need to re-open the **Launcher** tab or restart 16Launcher for the new theme to appear in the list.

### When Manual Folder Copying Is Better Than ZIP Import

The manual method is ideal when:
* The theme is actively under development;
* You need to make quick tweaks without constantly re-zipping files;
* You are tailoring a theme for a local project or resource set;
* You need granular control over files in the folder.

Meanwhile, ZIP import remains superior for distribution and sharing with other users, as the entire package is delivered in a single file.

### Importance of Correct Folder Structure

Theme files must not be scattered randomly; they must sit strictly within their specific theme folder. Leaving files directly in the root of `themes` without a folder will prevent 16Launcher from recognizing them. The same applies if `theme.json` and `style.css` are hidden too deep inside nested subfolders.

The core rule is simple: each theme gets one folder, containing `theme.json` and `style.css`.

---

## 6. Creating a Theme inside 16Launcher

16Launcher lets you create a new theme directly from the settings menu.

Steps:

1. Navigate to **Settings → Launcher → Custom Theme**.
2. Click **Create Theme**.
3. Enter a title for the theme.
4. 16Launcher creates a new theme directory.
5. Default `theme.json` and `style.css` files are generated inside.
6. Click **Edit CSS** to open `style.css` in an external editor.
7. Make your changes.
8. Save the file.

After saving your CSS edits, toggle the theme off and back on to apply changes.

### How Theme Generation Works

When creating a theme, 16Launcher automatically formats a folder name derived from the title you entered and generates starter files. This is convenient because:
* No manual directory creation is required;
* You get a ready-made template to start hacking on;
* You can rapidly prototype ideas;
* The resulting theme can easily be saved and zipped later.

### What to Do After Saving CSS

After editing the file, users often expect changes to render instantly. In the current version of 16Launcher, live-reloading does not always happen automatically. It is important to remember that the CSS editor is not a live preview tool.

### Updating the Theme After Changing CSS

Currently, 16Launcher does not feature real-time file watcher support for `style.css`.

Therefore, after editing the file, you must:

* Switch to another theme and back;
* Or restart the launcher.

Keep this in mind during development: saving a file in your text editor will not automatically trigger an immediate interface update.

When a theme is active, 16Launcher loads the CSS file once. If the file changes on disk, the runtime environment doesn't automatically re-read the stylesheet. Hence, stick to this workflow:
1. Edit CSS;
2. Save file;
3. Toggle theme or restart app;
4. Verify results.

### Recommended Development Practices

In the early stages of design, it is helpful to:
* Make small, incremental changes;
* Test after every save;
* Tweak one style component at a time;
* Keep selectors minimal;
* Avoid aggressive global overrides that could break UI functionality.

---

## 7. Theme ID and Display Name

Every theme has two distinct names:

1. **Theme ID** — The technical directory name;
2. **Theme Name** — The display title shown to the user.

These serve different purposes and should not be confused.

### 7.1. Theme ID

The ID is the name of the theme's folder on disk.

For example:

```text
ocean-mint/
```

where `ocean-mint` is the theme ID.

Recommended guidelines:

* Use Latin characters;
* Use numbers if needed;
* Use `-` and `_`;
* Avoid spaces;
* Avoid special characters;
* Prefer lowercase lettering;
* Keep it short and descriptive.

Good examples:

```text
ocean-mint
dark-glass
baza-emerald
my-theme
theme_01
```

Avoid:

```text
My Theme!!!
theme 1
Cool Theme (final)
new-theme-v1
```

When using the **Create Theme** button, 16Launcher automatically derives the ID from the title you supply.

For example:

```text
Ocean Mint
```

becomes:

```text
ocean-mint
```

When importing a ZIP file, the ID is derived from the ZIP archive's filename.

### 7.2. Display Name

The display name is specified in the `name` field inside `theme.json`.

Unlike the ID, this name is meant for human display.

Here you can freely use:
* Non-Latin character sets (Cyrillic, CJK, etc.);
* Spaces;
* Capitalization;
* Special characters;
* Any UTF-8 symbols.

Example:

```json
{
  "name": "Emerald Ocean",
  "author": "BAZA",
  "description": "Green-teal theme for 16Launcher",
  "version": "1.0"
}
```

In this setup:
* The theme ID can be `ocean-mint`;
* The user-facing display name is `Emerald Ocean`.

### Why Distinguishing ID and Name Matters

This distinction is crucial when publishing, sharing, or maintaining themes over time. The folder on disk should be clean and system-friendly, while the display name can be decorative and friendly.

For instance, a folder named `dark-glass` on disk can present itself as **Glassy Darkness**, **Dark Glass**, or **Midnight Glass** in the UI. This improves aesthetics without introducing illegal file system paths.

---

## 8. `theme.json` Format

The `theme.json` file contains metadata about the theme.

Minimal example:

```json
{
  "name": "My Theme",
  "author": "Your Name",
  "description": "Short description of the theme",
  "version": "1.0"
}
```

Supported fields:

| Field | Purpose |
| --- | --- |
| `name` | Theme display name shown in the UI |
| `author` | Theme author |
| `description` | Brief summary of the theme |
| `version` | Theme version string |

All fields are optional. However, it is strongly recommended to specify at least `name`, `author`, `description`, and `version`, especially if you intend to distribute your theme.

If `name` is omitted or left empty, the launcher UI may fall back to displaying the folder name.

### What Is Theme Metadata

The `theme.json` file is not just for visual presentation. It serves as an index entry used by the launcher to track, identify, and manage installed themes. When sharing themes, having clear metadata (title, author, version, description) ensures a polished user experience.

### Theme Versioning

Use a clear, semantic-style versioning format:

```text
1.0
```

or:

```text
1.2.0
```

When releasing significant updates, increment the version number so users can easily distinguish new releases from older ones.

This is especially helpful when themes are shared or updated online. Consistent versioning makes tracking changes, comparing updates, and evaluating compatibility straightforward.

### File Encoding

`theme.json` **must** be saved using **UTF-8** encoding.

This is essential when using non-ASCII characters or special symbols. Incorrect encoding will cause corrupted text or loading failures.

Problems arising from non-UTF-8 encodings (like ANSI or UTF-16) include:
* Replacement character artifacts (``);
* Unreadable text strings;
* Garbled theme names;
* JSON parsing errors.

Always verify that your editor saves `theme.json` as UTF-8 without BOM.

---

## 9. `style.css` Format

The core visual design of a theme is defined inside `style.css`.

This is standard CSS, allowing you to use all supported CSS properties, selectors, variables, gradients, background images, web fonts, and effects supported by 16Launcher's UI engine.

Basic example:

```css
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

.interactive-press {
  border-radius: 16px !important;
}

.sidebar-icon-active {
  color: #6ee7b7 !important;
}
```

### Why Theme CSS Must Be Named `style.css`

Because 16Launcher explicitly looks for `style.css` as the primary stylesheet entry point. All custom rule overrides must reside within or be imported into this file.

### Understanding Theme CSS Features

In your theme, you can utilize:
* Class selectors;
* CSS variables;
* Pseudo-classes (`:hover`, `:active`, etc.);
* `background`, `color`, `border`, `border-radius`, `opacity`, `box-shadow`;
* `url(...)` image references;
* `@font-face` custom font declarations.

Keep in mind that 16Launcher's default styles may carry high specificity. Consequently, some properties require `!important` flags to successfully override app defaults.

### Using `!important`

Default styles in 16Launcher might take precedence over your theme's rules.

When overrides fail to apply, appending `!important` usually resolves specificity issues.

Example:

```css
.glass-panel {
  background: rgba(6, 40, 30, 0.75) !important;
}
```

Avoid adding `!important` indiscriminately to every line. Test whether standard rules work first before adding flags.

Overusing `!important` can:
* Make style maintenance difficult;
* Complicate future tweaks;
* Conflict with app layout updates;
* Unintentionally override unwanted child elements.

Use `!important` purposefully, only where genuine specificity conflicts exist.

---

## 10. Key Selectors in 16Launcher

The following primary classes and CSS variables are available for styling:

| Selector | Purpose |
| --- | --- |
| `.glass-panel` | Main translucent glass panel containers |
| `.glass-chip` | Small chips, badges, and tags |
| `.interactive-press` | Clickable interactive elements and buttons |
| `.accent-bg` | Accent-colored backgrounds (including buttons) |
| `.accent-border` | Accent-colored borders |
| `.accent-chip` | Accent-colored chips |
| `.sidebar-icon-active` | Currently active sidebar icon |
| `:root` | Root level element for declaring CSS variables |
| `--accent-color` | Primary accent color variable |

The set of available classes may expand as 16Launcher evolves. When building complex themes, check your layout after launcher updates.

### Working with Selectors

To re-skin container backgrounds, target `.glass-panel`. To restyle primary action buttons, target `.interactive-press` or `.accent-bg`. For sidebar navigation highlights, adjust `.sidebar-icon-active`.

### What to Do If a Specific Class Is Missing

If a specific element lacks a dedicated class, you can use broader CSS selectors. However, exercise caution: global selectors can unintentionally alter unrelated UI components.

For instance, applying rules to generic button elements might recolor unwanted dialog controls. To keep your theme clean:
* Prefer explicit class names;
* Combine parent and child selectors;
* Inspect visual results carefully;
* Avoid sweeping global re-styling rules.

### CSS Variables

Variables are best declared inside `:root`:

```css
:root {
  --accent-color: #10b981;
}
```

Using CSS variables offers clear benefits:
* Change a color once to update it everywhere;
* Streamlines theme maintenance;
* Enables easy creation of alternate color palettes;
* Keeps stylesheets clean and readable.

Note that not all UI elements rely exclusively on CSS variables. Some elements bind directly to specific classes, while others leverage custom variables.

---

## 11. Using Images

You can bundle local images with your theme.

Example:

```text
ocean-mint/
├── theme.json
├── style.css
└── background.png
```

Reference the image inside `style.css`:

```css
.glass-panel {
  background-image: url(background.png) !important;
  background-size: cover !important;
}
```

Image paths must always be **relative**.

If images are stored in a subfolder:

```text
ocean-mint/
├── theme.json
├── style.css
└── images/
    └── background.png
```

use:

```css
.glass-panel {
  background-image: url(images/background.png) !important;
}
```

16Launcher resolves relative `url(...)` statements and maps them to the local theme directory.

### Why You Must Not Use Absolute Paths

Never use local absolute paths bound to your specific machine, such as:

```text
C:\Users\User\Desktop\background.png
```

Absolute paths will break as soon as the theme is shared with anyone else.

Absolute paths:
* Bind the theme to a specific machine;
* Depend on specific user profile names;
* Fail when directory trees differ;
* Break portability entirely.

### Best Practices for Theme Images

When using background graphics:
* Keep image file sizes reasonably small;
* Use suitable resolutions for sharp rendering across display scales;
* Use `background-size: cover` or `contain` appropriately;
* Pick background images that maintain UI text legibility;
* Avoid noisy backgrounds behind dense UI text.

A great approach is combining subtle assets:
* A translucent panel overlay;
* A soft CSS gradient;
* A subtle background pattern/texture;
rather than relying on heavy high-res wallpapers that slow down rendering.

---

## 12. Using Custom Fonts

You can bundle custom font files inside your theme folder.

Example:

```text
ocean-mint/
├── theme.json
├── style.css
└── fonts/
    └── MyFont.woff2
```

Import fonts using `@font-face`:

```css
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}
```

Before redistributing themes containing custom fonts, verify that the font license permits bundling and sharing.

### Font Licensing Considerations

Custom fonts enhance design, but copyright restrictions apply. Including commercial or non-redistributable fonts in public theme packages can lead to licensing issues.

Recommendations:
* Use open-source or freely redistributable fonts (e.g., Google Fonts, OFL);
* Include license text files in the archive when required;
* Never redistribute proprietary fonts without permission;
* Verify distribution rights beforehand.

### When Custom Fonts Work Best

Custom fonts shine when:
* Emulating a specific gaming or brand aesthetic;
* Designing stylized display headers;
* Crafting themed UI accents.

However, unreadable or improperly scaled fonts degrade usability. Balance typography aesthetics with interface clarity.

---

## 13. Theme Creation Best Practices

Follow these guidelines when designing custom themes:

### Leverage CSS Variables

When repeating color values across multiple rules, define them centrally:

```css
:root {
  --accent-color: #10b981;
}
```

This makes palette changes effortless.

Benefits of variables:
* Tweak one value to update the whole palette;
* Easily generate color variants;
* Maintains consistency across complex stylesheets;
* Makes code easier to read.

### Never Modify 16Launcher Core Files

Keep all modifications strictly contained inside your theme directory.

Do not edit launcher application files to achieve visual changes.

Why this matters:
1. Core application changes will be wiped during app updates;
2. Modifying application files can corrupt installation integrity.

Themes are isolated modules designed to run safely within the directory structure provided by 16Launcher.

### Always Use Relative Paths

For assets like fonts and images, always use relative paths:

```css
url(images/background.png)
```

Never use machine-specific absolute paths. This ensures portable, cross-platform compatibility.

### Test Thoroughly After Installation

Before publishing or sharing your theme, test:
* All main container panels;
* Buttons and interactive states;
* Active tab and sidebar highlights;
* Background images;
* Custom fonts;
* Application restarts (checking persistent state);
* ZIP archive import verification.

Verify overall UI readability, contrast, and layout coherence across different screens rather than focusing on a single element.

### Start Small

A common mistake among beginners is attempting a massive redesign filled with complex animations, shadows, and heavy graphic assets right away. This often causes:
* Difficult debugging;
* Specificity conflicts;
* Poor UI contrast and readability;
* Breakages when the launcher updates.

Start simple:
1. Change primary accent colors;
2. Adjust panel background opacity/tint;
3. Fix contrast and readability;
4. Add fine details and textures incrementally.

---

## 14. Sharing Your Theme

Package your theme folder into a ZIP archive for distribution.

Steps:

1. Open your theme directory.
2. Confirm `theme.json` and `style.css` are present.
3. Check that referenced images and fonts are included.
4. Compress the folder into a ZIP archive.
5. Share the ZIP file.

You can archive the parent folder directly:

```text
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    ├── style.css
    └── background.png
```

Or compress the theme files directly at the root level of the ZIP:

```text
ocean-mint.zip
├── theme.json
└── style.css
```

Both formats are supported. Name the ZIP file after the theme ID:

```text
ocean-mint.zip
```

This keeps theme files organized and ensures a clean auto-generated ID upon import.

End users can install your theme via:

**Settings → Launcher → Custom Theme → Import ZIP**

### Why Proper Archiving Matters

ZIP archives are the standard distribution method because they:
* Bundle all required assets into one portable file;
* Share easily via messaging, community forums, or repositories;
* Retain folder hierarchy;
* Simplify installation for non-technical users.

### Pre-Packaging Checklist

Before sending your archive:
* Remove temporary or hidden OS files (`.DS_Store`, `Thumbs.db`);
* Verify that file paths inside CSS are relative;
* Ensure `theme.json` and `style.css` exist at expected locations;
* Test importing the ZIP file on a clean installation.

---

## 15. Removing a Theme

You can delete installed themes directly inside 16Launcher:

1. Open the custom theme list.
2. Select the target theme.
3. Click **Delete Theme**.
4. Confirm deletion.

Alternatively, manually delete the theme folder from the `themes` directory on disk.

### When Manual Deletion Is Useful

Manual deletion is helpful if:
* Cleaning up multiple unused themes at once;
* Fixing a corrupted theme folder;
* Removing broken theme leftovers that fail to load in the UI.

When deleting manually, ensure that:
* You are not deleting files you still need;
* The theme being removed is not currently active;
* You reselect a valid theme after manual deletion.

### Built-In Themes

Certain default themes bundled with 16Launcher may automatically restore themselves upon launcher startup.

For instance, if you delete the bundled `example-theme` folder, 16Launcher may recreate it from internal resources if it notices the folder is missing.

Keep in mind the distinction between:
* User themes installed manually (permanently deleted upon removal);
* Built-in themes (which may auto-restore on boot).

---

## 16. Troubleshooting

### Theme Does Not Appear in the List

Check the following:
* Does the theme folder exist?
* Is `theme.json` present?
* Is `style.css` present?
* Are both files located inside the theme directory root?
* Is `theme.json` valid JSON without syntax errors?
* Is the folder placed inside the correct `themes` directory?

Expected path:

```text
themes/
└── my-theme/
    ├── theme.json
    └── style.css
```

If required files are missing, the app will ignore the directory.

### Imported Theme Has an Incorrect ID

Theme IDs are derived from the ZIP filename upon import.

For example:

```text
My Cool Theme.zip
```

may result in a modified ID string.

To fix an unwanted ID, rename the ZIP file before importing, or install the folder manually.

### CSS Changes Do Not Take Effect

Common causes:
1. CSS selector syntax error or mismatch;
2. App default rules have higher specificity;
3. Missing `!important` flags where required;
4. The theme was not re-applied after file modification;
5. Edits were not saved in the text editor.

After editing `style.css`, switch themes or restart 16Launcher to force a reload.

### Images Fail to Load

Verify:
* Does the image file exist inside the theme folder?
* Is the relative path in `url(...)` written correctly?
* Does filename case match exactly (especially important on Linux)?

Example:

```css
background-image: url(images/background.png);
```

requires an actual file at:

```text
images/background.png
```

Remember that file paths are case-sensitive on Linux/macOS. If your file is named `Background.png` but referenced as `background.png`, it will fail to load.

### Theme Reverted to Default After Resetting Settings

Resetting launcher settings restores default configuration values, which unselects active custom themes.

However, your custom theme folder inside `themes` remains untouched on disk.

To restore your look, open custom theme settings and re-select your theme from the list.

---

## 17. Recommended Ready-to-Use Theme Structure

For distribution, structure your theme folder like this:

```text
ocean-mint/
├── theme.json
├── style.css
├── images/
│   └── background.png
└── fonts/
    └── MyFont.woff2
```

Sample `theme.json`:

```json
{
  "name": "Emerald Ocean",
  "author": "BAZA",
  "description": "Green-teal theme for 16Launcher",
  "version": "1.0.0"
}
```

Sample `style.css`:

```css
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

### Why This Structure Is Recommended

This layout is:
* Logical and organized;
* Easy for users to inspect;
* Portable and quick to archive;
* Simple to maintain;
* Keeps images and fonts clearly separated;
* Prevents import ambiguity;
* Follows standard packaging conventions.

---

## 18. Pre-Publishing Checklist

Run through this checklist before sharing your theme:

* [ ] Theme folder uses a valid ID format (e.g., `my-theme`).
* [ ] `theme.json` is present.
* [ ] `style.css` is present.
* [ ] `theme.json` is encoded in UTF-8.
* [ ] `theme.json` contains a clear `name`.
* [ ] `author` field is filled in.
* [ ] `version` field is specified.
* [ ] `description` field is populated.
* [ ] All images and font assets are placed inside the theme folder.
* [ ] All CSS asset paths use relative `url(...)` declarations.
* [ ] Visual styling renders correctly in 16Launcher.
* [ ] Intended CSS rules apply without broken specificity issues.
* [ ] Theme persists properly after restarting the launcher.
* [ ] ZIP archive imports smoothly via **Import ZIP**.
* [ ] Unnecessary temporary files (`.DS_Store`, etc.) are removed from the archive.

---

## 19. Quick Start Guide

Create your first custom theme in minutes.

### Step 1. Create a New Theme

Go to:

**Settings → Launcher → Custom Theme → Create Theme**

Enter a name, for example:

```text
My Theme
```

16Launcher generates the theme directory and baseline files.

### Step 2. Open CSS File

Click **Edit CSS**.

This opens:

```text
style.css
```

### Step 3. Add Custom Styles

Add sample styling:

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

Save the file.

### Step 4. Apply Your Theme

Switch theme selection to **Default**, then select your new theme again.

Alternatively, restart 16Launcher completely.

Your CSS changes will apply to the interface.

### Step 5. Package for Distribution

When finished, compress your theme folder into a ZIP archive:

```text
my-theme.zip
└── my-theme/
    ├── theme.json
    └── style.css
```

Share the archive with others. Users can install it instantly using **Import ZIP**.

---

## 20. Sample Themes

16Launcher comes bundled with sample themes for reference.

For example:

* `example-theme` — Demonstration purple theme;
* `baza-emerald` — Test emerald theme.

You can inspect these theme folders to study layout patterns, CSS rules, and file organization when building your own custom themes.
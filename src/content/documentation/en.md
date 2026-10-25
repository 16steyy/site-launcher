# 16Launcher themes

A theme is a folder with a CSS file that restyles the launcher: colors, background, corner radius, panels, buttons. This page covers everything you need to install someone else's theme or build your own.

## Quick start

1. Open **Settings → Launcher → Custom theme** and click **Create theme**.
2. Enter a name, for example `My theme`. The launcher creates a folder with `theme.json` and `style.css`.
3. Click **Edit CSS** and paste:

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

4. Save the file, pick **Default**, then pick your theme again. The changes are now applied.
5. When you're happy with it, zip the theme folder and send it to friends or upload it to the [theme catalog](/themes/upload).

The rest of this page goes through the same steps in more detail.

## What a theme is made of

Two files at minimum:

| File | Contents |
| --- | --- |
| `theme.json` | Name, author, description and version |
| `style.css` | Styles that change the interface |

You can put images and fonts next to them:

```text
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2
```

A theme doesn't replace the interface, it sits on top of the default look. It can't change the launcher's layout: you can recolor a panel, but you can't move buttons around.

## Where themes live

| System | Folder |
| --- | --- |
| Windows | `%APPDATA%\16Launcher\themes\` |
| Linux | `~/.local/share/16Launcher/themes/` |
| macOS | `~/Library/Application Support/16Launcher/themes/` |

The easiest way to get there is from the launcher: **Settings → Launcher → Custom theme → Open themes folder**.

Each theme gets its own folder, with the files directly inside it:

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

If `theme.json` and `style.css` sit directly in `themes/`, or one level too deep, the launcher won't find the theme.

## Turning a theme on

1. Open **Settings** → **Launcher** tab.
2. In the **Customization** section, open **Custom theme**.
3. Pick a theme from the list.

The theme applies right away and is remembered, so you don't have to pick it again after a restart. To go back to the normal look, choose **Default**. The theme folder stays where it is.

## Installing

### From a ZIP archive

1. Open **Settings → Launcher → Custom theme**.
2. Click **Import ZIP** and choose the archive.
3. Pick the new theme in the list.

Both archive layouts work: files at the root, or inside a single folder.

```text
ocean-mint.zip              ocean-mint.zip
├── theme.json              └── ocean-mint/
└── style.css                   ├── theme.json
                                └── style.css
```

On import, the theme ID comes from the archive name. `Ocean Mint.zip` becomes `ocean-mint`, so it's best to name the archive in lowercase Latin letters with no spaces from the start.

### Manually

Copy the theme folder into `themes` and pick it in settings. If the theme list was open while you copied, switch tabs or restart the launcher.

This is handy while a theme is still in progress: you edit files in place and don't have to rebuild the archive every time.

## ID and name

A theme has two names, and they mean different things.

The **ID** is the folder name on disk, for example `ocean-mint`. Use lowercase Latin letters, digits, `-` and `_`. No spaces or special characters.

```text
ocean-mint     ✓
dark-glass     ✓
theme_01       ✓
My theme!!!    ✗
theme 1        ✗
```

When you use **Create theme**, the ID is derived from the name (`Ocean Mint` → `ocean-mint`). On import, it comes from the ZIP file name.

The **name** is what shows up in the theme list. It's set by the `name` field in `theme.json`, and you can write it however you like: any script, spaces, capital letters. A folder called `dark-glass` can show up in the launcher as "Midnight Glass".

## theme.json

```json
{
  "name": "Emerald Ocean",
  "author": "BAZA",
  "description": "A green and teal theme for 16Launcher",
  "version": "1.0.0"
}
```

| Field | Meaning |
| --- | --- |
| `name` | Name in the theme list |
| `author` | Author |
| `description` | Short description |
| `version` | Version, e.g. `1.0` or `1.2.0` |

All fields are optional. Without `name`, the launcher shows the folder name. If other people will download your theme, fill everything in and bump `version` when you make noticeable changes.

Save the file as **UTF-8**. In any other encoding, non-Latin characters in the name turn into garbage.

## style.css

Plain CSS. Variables, gradients, `url(...)`, `@font-face`, pseudo-classes and everything else the launcher UI supports all work.

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

### When you need !important

The launcher's built-in styles sometimes have higher priority, and your rule silently loses. In that case, add `!important`. Don't put it on everything: check whether the rule works without it first. The fewer `!important`s you have, the easier it is to figure out later where a style comes from.

### Changes don't show up right away

The launcher reads `style.css` once, when the theme is applied, and doesn't watch the file. After saving, pick **Default** and then your theme again, or restart the launcher.

## Selectors and variables

| Selector | What it changes |
| --- | --- |
| `.glass-panel` | Main glass panels |
| `.glass-chip` | Small chips and badges |
| `.interactive-press` | Buttons and other clickable elements |
| `.accent-bg` | Accent background, including some buttons |
| `.accent-border` | Accent border |
| `.accent-chip` | Accent chips |
| `.sidebar-icon-active` | Active sidebar icon |
| `--accent-color` | Main accent color, set in `:root` |

`--accent-color` is the easiest place to start: one line and the accent changes across the whole interface. Not every element reads from the variable, though, so some will need to be recolored through their classes.

If there's no class for what you need, you can use a broader selector, just check that it doesn't catch anything extra. The set of classes changes along with the launcher, so complex themes are worth re-checking after updates.

## Images and fonts

Put the files in the theme folder and reference them with a relative path:

```css
.glass-panel {
  background-image: url(images/background.png) !important;
  background-size: cover !important;
}
```

The launcher turns `url(images/background.png)` into the path of the file inside your theme. Absolute paths like `C:\Users\User\Desktop\background.png` only work on your machine: nobody else has that file.

Fonts go through `@font-face`:

```css
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}
```

A few tips:

- Don't ship a 20 MB background. It won't make the launcher look better, and the theme becomes a pain to download.
- If you plan to share the theme, check that the font's license allows redistribution.
- File names are case-sensitive: on Linux, `Background.png` and `background.png` are different files.

## Sharing a theme

Zip the theme folder and give the archive the same name as the ID: `ocean-mint.zip`. That way, the person you send it to gets the same ID after **Import ZIP**.

Before sending, remove anything that doesn't belong: drafts, `.psd` files, editor leftovers.

### Publishing to the catalog

You can upload your theme to the [catalog on the site](/themes/upload) so other people can find it. You'll need a 16Launcher account. Limits:

- archive up to 5 MB;
- `theme.json` and `style.css` are required;
- allowed files: `.json`, `.css`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.txt`.

After upload, the theme goes to moderation. That usually takes 1–2 days.

## Removing a theme

Select the theme in the list, click **Delete theme** and confirm. Or just delete its folder from `themes`.

Built-in themes such as `example-theme` are restored on the next launch if their folder is missing.

## Troubleshooting

### The theme doesn't show up in the list

- Does the theme folder contain both `theme.json` and `style.css`?
- Are the files directly in the theme folder, not in a subfolder?
- Is the theme folder inside `themes`?
- Is `theme.json` valid JSON? A trailing comma after the last field is a common mistake.

### CSS isn't applied

- Did you save the file?
- Did you re-apply the theme after saving (via **Default** or a restart)?
- Does the selector actually match the element?
- Is a built-in style stronger? Try `!important`.

### An image doesn't show up

Check that the file is inside the theme folder, the path in `url(...)` is relative, and the letter case in the file name matches.

### The ID came out wrong

The ID comes from the ZIP name. Rename the archive and import the theme again.

### The theme disappeared after resetting settings

A reset clears the selected theme but leaves the folder alone. Open the theme list and pick it again.

## Checklist before publishing

- [ ] Folder ID in Latin letters, no spaces: `my-theme`
- [ ] Both `theme.json` and `style.css` are present
- [ ] `theme.json` is UTF-8 and has `name`, `author`, `description`, `version`
- [ ] Images and fonts are inside the theme folder
- [ ] All paths in the CSS are relative
- [ ] The theme looks right on every launcher tab, not just the home screen
- [ ] The theme is still applied after restarting the launcher
- [ ] The ZIP imports through **Import ZIP** without errors
- [ ] The archive has no extra files

## Examples

The launcher ships with two themes that make a good starting point:

- `example-theme`, a purple demo theme;
- `baza-emerald`, an emerald test theme.

Open their folders and see how the files are put together. There are more in the [theme catalog](/themes): download any of them and take it apart.

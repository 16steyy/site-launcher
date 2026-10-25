# Temas de 16Launcher

Un tema es una carpeta con un archivo CSS que cambia el aspecto del launcher: colores, fondo, bordes redondeados, paneles, botones. Aquí tienes todo lo necesario para instalar el tema de otra persona o crear el tuyo.

## Inicio rápido

1. Abre **Ajustes → Launcher → Tema personalizado** y pulsa **Crear tema**.
2. Escribe un nombre, por ejemplo `Mi tema`. El launcher crea una carpeta con `theme.json` y `style.css`.
3. Pulsa **Editar CSS** y pega:

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

4. Guarda el archivo, elige **Predeterminado** y luego otra vez tu tema. Los cambios ya se ven.
5. Cuando esté listo, comprime la carpeta del tema en un ZIP y pásaselo a tus amigos o súbelo al [catálogo de temas](/themes/upload).

Más abajo están los mismos pasos con más detalle.

## De qué se compone un tema

Como mínimo, dos archivos:

| Archivo | Contenido |
| --- | --- |
| `theme.json` | Nombre, autor, descripción y versión |
| `style.css` | Estilos que cambian la interfaz |

Al lado puedes poner imágenes y fuentes:

```text
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2
```

Un tema no sustituye la interfaz, se aplica encima del diseño estándar. No cambia la estructura del launcher: puedes cambiar el color de un panel, pero no mover los botones de sitio.

## Dónde se guardan los temas

| Sistema | Carpeta |
| --- | --- |
| Windows | `%APPDATA%\16Launcher\themes\` |
| Linux | `~/.local/share/16Launcher/themes/` |
| macOS | `~/Library/Application Support/16Launcher/themes/` |

Lo más fácil es abrirla desde el propio launcher: **Ajustes → Launcher → Tema personalizado → Abrir carpeta de temas**.

Cada tema tiene su propia carpeta, con los archivos directamente dentro:

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

Si `theme.json` y `style.css` están sueltos en `themes/` o un nivel más abajo de la cuenta, el launcher no encuentra el tema.

## Activar un tema

1. Abre **Ajustes** → pestaña **Launcher**.
2. En la sección **Personalización**, abre **Tema personalizado**.
3. Elige un tema de la lista.

El tema se aplica al momento y se recuerda, así que no hace falta elegirlo de nuevo tras reiniciar. Para volver al aspecto normal, elige **Predeterminado**. La carpeta del tema se queda donde está.

## Instalación

### Desde un archivo ZIP

1. Abre **Ajustes → Launcher → Tema personalizado**.
2. Pulsa **Importar ZIP** y elige el archivo.
3. Selecciona el tema nuevo en la lista.

Valen las dos formas de empaquetar: archivos en la raíz o dentro de una única carpeta.

```text
ocean-mint.zip              ocean-mint.zip
├── theme.json              └── ocean-mint/
└── style.css                   ├── theme.json
                                └── style.css
```

Al importar, el ID del tema se saca del nombre del archivo. `Ocean Mint.zip` se convierte en `ocean-mint`, así que conviene nombrar el ZIP desde el principio en minúsculas y sin espacios.

### A mano

Copia la carpeta del tema dentro de `themes` y elígela en los ajustes. Si la lista de temas estaba abierta mientras copiabas, cambia de pestaña o reinicia el launcher.

Es lo más cómodo mientras el tema está en desarrollo: editas los archivos en su sitio y no tienes que rehacer el ZIP cada vez.

## ID y nombre

Un tema tiene dos nombres, y no son lo mismo.

El **ID** es el nombre de la carpeta en el disco, por ejemplo `ocean-mint`. Usa letras latinas en minúscula, números, `-` y `_`. Sin espacios ni caracteres especiales.

```text
ocean-mint     ✓
dark-glass     ✓
theme_01       ✓
Mi tema!!!     ✗
theme 1        ✗
```

Con **Crear tema**, el ID sale del nombre (`Ocean Mint` → `ocean-mint`); al importar, del nombre del archivo ZIP.

El **nombre** es lo que aparece en la lista de temas. Se define en el campo `name` de `theme.json` y puede ser como quieras: con tildes, espacios y mayúsculas. Una carpeta llamada `dark-glass` puede verse en el launcher como «Cristal Oscuro».

## theme.json

```json
{
  "name": "Océano Esmeralda",
  "author": "BAZA",
  "description": "Un tema verde y turquesa para 16Launcher",
  "version": "1.0.0"
}
```

| Campo | Qué es |
| --- | --- |
| `name` | Nombre en la lista de temas |
| `author` | Autor |
| `description` | Descripción corta |
| `version` | Versión, p. ej. `1.0` o `1.2.0` |

Todos los campos son opcionales. Sin `name`, el launcher muestra el nombre de la carpeta. Si otras personas van a descargar tu tema, rellénalos todos y sube `version` cuando hagas cambios notables.

Guarda el archivo en **UTF-8**. Con otra codificación, las tildes y la ñ del nombre se convierten en símbolos raros.

## style.css

CSS normal y corriente. Funcionan las variables, los degradados, `url(...)`, `@font-face`, las pseudoclases y todo lo demás que admita la interfaz del launcher.

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

### Cuándo hace falta !important

A veces los estilos internos del launcher tienen más prioridad y tu regla pierde sin avisar. En ese caso, añade `!important`. No lo pongas en todo: primero comprueba si la regla funciona sin él. Cuantos menos `!important` haya, más fácil será saber luego de dónde sale cada estilo.

### Los cambios no se ven al instante

El launcher lee `style.css` una sola vez, al aplicar el tema, y no vigila el archivo. Después de guardar, elige **Predeterminado** y otra vez tu tema, o reinicia el launcher.

## Selectores y variables

| Selector | Qué cambia |
| --- | --- |
| `.glass-panel` | Paneles de cristal principales |
| `.glass-chip` | Chips y etiquetas pequeñas |
| `.interactive-press` | Botones y otros elementos clicables |
| `.accent-bg` | Fondo de acento, también en algunos botones |
| `.accent-border` | Borde de acento |
| `.accent-chip` | Chips de acento |
| `.sidebar-icon-active` | Icono activo de la barra lateral |
| `--accent-color` | Color de acento principal, se define en `:root` |

Lo más fácil es empezar por `--accent-color`: una línea y el acento cambia en toda la interfaz. Pero no todos los elementos usan la variable, a algunos tendrás que cambiarles el color por su clase.

Si no hay una clase para lo que buscas, puedes usar un selector más amplio; solo revisa que no afecte a nada más. Las clases cambian junto con el launcher, así que vale la pena revisar los temas complejos después de cada actualización.

## Imágenes y fuentes

Pon los archivos en la carpeta del tema y enlázalos con una ruta relativa:

```css
.glass-panel {
  background-image: url(images/background.png) !important;
  background-size: cover !important;
}
```

El launcher convierte `url(images/background.png)` en la ruta del archivo dentro de tu tema. Las rutas absolutas como `C:\Users\User\Desktop\background.png` solo funcionan en tu equipo: nadie más tiene ese archivo.

Las fuentes se cargan con `@font-face`:

```css
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}
```

Algunos consejos:

- No metas un fondo de 20 MB. El launcher no se verá mejor y el tema será un rollo de descargar.
- Si vas a compartir el tema, comprueba que la licencia de la fuente permite redistribuirla.
- Las mayúsculas en los nombres de archivo importan: en Linux, `Background.png` y `background.png` son archivos distintos.

## Compartir un tema

Comprime la carpeta del tema en un ZIP y ponle al archivo el mismo nombre que el ID: `ocean-mint.zip`. Así, quien lo reciba tendrá el mismo ID que tú después de **Importar ZIP**.

Antes de enviarlo, quita lo que sobre: borradores, archivos `.psd`, restos del editor.

### Publicar en el catálogo

Puedes subir tu tema al [catálogo del sitio](/themes/upload) para que otros lo encuentren. Necesitas una cuenta de 16Launcher. Límites:

- archivo de hasta 5 MB;
- `theme.json` y `style.css` son obligatorios;
- archivos permitidos: `.json`, `.css`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.txt`.

Tras subirlo, el tema pasa a moderación. Suele tardar 1–2 días.

## Eliminar un tema

Selecciona el tema en la lista, pulsa **Eliminar tema** y confirma. O simplemente borra su carpeta de `themes`.

Los temas incluidos, como `example-theme`, se restauran en el siguiente inicio si falta su carpeta.

## Si algo no funciona

### El tema no aparece en la lista

- ¿La carpeta del tema tiene `theme.json` y `style.css`?
- ¿Los archivos están directamente en la carpeta del tema y no en una subcarpeta?
- ¿La carpeta del tema está dentro de `themes`?
- ¿`theme.json` es un JSON válido? Una coma después del último campo es un error habitual.

### El CSS no se aplica

- ¿Has guardado el archivo?
- ¿Has vuelto a aplicar el tema después de guardar (con **Predeterminado** o reiniciando)?
- ¿El selector coincide de verdad con el elemento?
- ¿Hay un estilo interno más fuerte? Prueba con `!important`.

### Una imagen no se ve

Comprueba que el archivo está dentro de la carpeta del tema, que la ruta en `url(...)` es relativa y que las mayúsculas del nombre coinciden.

### El ID ha salido mal

El ID sale del nombre del ZIP. Cambia el nombre del archivo e importa el tema otra vez.

### El tema desapareció al restablecer los ajustes

El restablecimiento quita el tema seleccionado, pero no toca la carpeta. Abre la lista de temas y elígelo de nuevo.

## Lista de comprobación antes de publicar

- [ ] ID de la carpeta en letras latinas, sin espacios: `my-theme`
- [ ] Están `theme.json` y `style.css`
- [ ] `theme.json` en UTF-8 con `name`, `author`, `description` y `version`
- [ ] Las imágenes y fuentes están dentro de la carpeta del tema
- [ ] Todas las rutas del CSS son relativas
- [ ] El tema se ve bien en todas las pestañas del launcher, no solo en la principal
- [ ] Tras reiniciar el launcher, el tema sigue aplicado
- [ ] El ZIP se importa con **Importar ZIP** sin errores
- [ ] El archivo no lleva nada que sobre

## Ejemplos

El launcher trae dos temas que sirven de punto de partida:

- `example-theme`, un tema de demostración morado;
- `baza-emerald`, un tema de prueba color esmeralda.

Abre sus carpetas para ver cómo están montados. Hay más en el [catálogo de temas](/themes): descarga cualquiera y destripa cómo está hecho.

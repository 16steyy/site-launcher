# Temas personalizados de 16Launcher

Los temas personalizados te permiten cambiar la apariencia de la interfaz de 16Launcher mediante CSS. Un tema puede modificar colores, fondos, bordes redondeados, bordes, elementos de acento y otras propiedades visuales de la interfaz.

Este artículo describe cómo instalar, crear, configurar, eliminar y distribuir temas para 16Launcher. Además, abordaremos dónde se almacenan exactamente los temas, cómo se organizan sus archivos, qué campos se utilizan en los metadatos (metadata), cómo conectar imágenes y fuentes, así como los errores más comunes y cómo evitarlos.

## 1. Qué es un tema

Un tema de 16Launcher consiste en una carpeta independiente con dos archivos obligatorios:

| Archivo | Propósito |
| --- | --- |
| `theme.json` | Metadatos del tema: nombre, autor, descripción y versión |
| `style.css` | Estilos CSS que modifican el aspecto visual de la interfaz |

Adicionalmente, en la carpeta del tema se pueden incluir imágenes, fuentes y otros recursos necesarios para el diseño.

Ejemplo de estructura de un tema:

```text
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2
```

Los archivos, recursos adicionales y la estructura interna de la carpeta pueden variar según el propósito del tema. Sin embargo, `theme.json` y `style.css` deben estar presentes de forma obligatoria.

Es importante comprender que un tema no reemplaza por completo la interfaz de 16Launcher. Se aplica sobre el diseño estándar de la aplicación y lo modifica mediante reglas CSS. Esto significa que el usuario no altera la estructura lógica del launcher, sino que solo recalifica o complementa visualmente la interfaz estándar.

Por ejemplo, un tema puede:
* Cambiar el color de acento principal;
* Modificar el color y la transparencia de los paneles;
* Personalizar la apariencia de los botones;
* Cambiar el redondeo de los elementos;
* Modificar el diseño de los elementos activos en la barra lateral;
* Añadir imágenes de fondo;
* Conectar fuentes personalizadas.

Esto permite realizar tanto pequeños ajustes visuales como esquemas de color completamente rediseñados. En la misma aplicación se pueden utilizar diferentes temas para distintos estados de ánimo: minimalista, oscuro, claro, de cristal (glass), para juegos, de alto contraste, etc.

### Cómo funciona un tema personalizado

Un tema personalizado en 16Launcher funciona mediante el principio de superposición CSS. El launcher ya contiene una estructura y estilos base, y el tema simplemente sobrescribe selectores, clases y variables CSS específicos.

En la práctica, esto significa que el tema puede:
* Cambiar el color principal de acento;
* Sobrescribir el fondo de los objetos;
* Modificar sombras, border, radius;
* Hacer semitransparentes paneles específicos;
* Cambiar el color del texto y los iconos;
* Establecer fondos alternativos, gradientes y efectos especiales.

No obstante, no es posible "reescribir" toda la interfaz desde cero, ya que 16Launcher sigue construyendo los elementos según su propia estructura. El tema debe funcionar dentro de los componentes existentes de la aplicación y no reemplazarlos manualmente.

### Por qué un tema no es solo un archivo CSS

El archivo `style.css` por sí solo no es un "script" completo. Debe tener en cuenta que 16Launcher utiliza sus propias clases, variables y estructura de elementos. Por esta razón, un tema casi siempre se construye sobre clases y variables CSS existentes en la aplicación, y no en selectores arbitrarios creados de la nada.

Por lo tanto, al desarrollar un tema es fundamental comprender:
* Qué clases se utilizan en la interfaz;
* Qué propiedades se pueden sobrescribir;
* Qué partes de la interfaz es mejor no tocar;
* Cómo garantizar la compatibilidad con futuras actualizaciones del launcher.

---

## 2. Ubicación de los temas

Tras instalar 16Launcher, los temas se almacenan en un directorio dedicado llamado `themes`.

La ubicación del directorio depende del sistema operativo.

| Sistema operativo | Directorio de temas |
| --- | --- |
| Windows | `%APPDATA%\16Launcher\themes\` |
| Linux | `~/.local/share/16Launcher/themes/` |
| macOS | `~/Library/Application Support/16Launcher/themes/` |

### Windows

En Windows, el directorio suele encontrarse en la siguiente ruta:

```text
C:\Users\<NombreDeUsuario>\AppData\Roaming\16Launcher\themes\
```

Reemplace `<NombreDeUsuario>` por el nombre de la cuenta de usuario activa de Windows.

### Linux

En Linux, la carpeta de temas suele ubicarse en el directorio del usuario:

```text
~/.local/share/16Launcher/themes/
```

Es la ubicación estándar para datos de aplicaciones de usuario y normalmente ya cuenta con permisos de escritura sin requerir privilegios elevados.

### macOS

En macOS, los temas suelen almacenarse en:

```text
~/Library/Application Support/16Launcher/themes/
```

Aquí también se utiliza el directorio de datos de aplicación de usuario, el cual no entra en conflicto con los archivos del sistema.

### Estructura del directorio

Cada tema debe estar ubicado en una carpeta independiente:

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

No coloque varios temas dentro de una misma carpeta. Cada tema debe tener su propio directorio.

### Cómo abrir el directorio de temas

Puede abrir el directorio de temas directamente desde la interfaz del launcher:

**Ajustes → Launcher → Tema personalizado → Abrir carpeta de temas**

Se recomienda este método si necesita instalar, modificar o eliminar un tema manualmente.

Este procedimiento resulta conveniente porque:
* No requiere buscar la ruta manualmente;
* Elimina el riesgo de equivocarse de carpeta;
* Permite abrir rápidamente el tema deseado para editarlo;
* Facilita la gestión de múltiples temas instalados.

### Aspecto importante sobre las carpetas de temas

Los archivos del tema deben estar ubicados exactamente dentro de su carpeta correspondiente, no en la raíz del directorio `themes` ni dentro de múltiples subcarpetas innecesarias. Si 16Launcher busca temas en un directorio específico, cada tema debe estar representado por una carpeta independiente con una estructura correcta.

---

## 3. Cómo activar un tema

Una vez instalado, el tema aparecerá en la lista de temas disponibles.

Para activar un tema:

1. Abra **Ajustes**.
2. Vaya a la pestaña **Launcher**.
3. Busque la sección **Personalización**.
4. Abra el apartado **Tema personalizado**.
5. Seleccione el tema deseado.

El tema se aplica inmediatamente después de seleccionarlo.

Para volver al diseño predeterminado de 16Launcher, seleccione **Predeterminado**.

El tema seleccionado se guarda en la configuración del launcher, por lo que no es necesario volver a seleccionarlo cada vez que inicie la aplicación.

### Cómo se aplica exactamente el tema

Cuando un usuario elige un tema, 16Launcher guarda su ID o nombre en las preferencias del usuario. Al iniciar el programa, este vuelve a cargar el tema activo y aplica el CSS a la interfaz.

Si el tema se modificó manualmente en la carpeta tras su instalación, es posible que los cambios no se reflejen de inmediato hasta que se recargue el archivo o se vuelva a seleccionar/recrear el tema. Esto se detallará más adelante en la sección sobre edición de CSS.

### Tema predeterminado

Seleccionar la opción **Predeterminado** generalmente significa volver al diseño inicial del launcher. Al hacerlo, la carpeta del tema no se elimina, simplemente se deja de usar. Esto resulta útil para comparar rápidamente el diseño sin perder el tema creado.

---

## 4. Instalación de un tema

Puede instalar un tema utilizando varios métodos.

### 4.1. Importación de un archivo ZIP

Importar un archivo ZIP es la forma más sencilla de instalar un tema listo para usar.

Pasos de instalación:

1. Abra los ajustes de temas personalizados.
2. Haga clic en **Importar ZIP**.
3. Seleccione el archivo ZIP con el tema.
4. Espere a que finalice la importación.
5. Seleccione el tema instalado en la lista.

Tras una importación exitosa, el tema aparecerá en el directorio `themes` y estará disponible en la lista de temas.

### Requisitos del archivo ZIP

En el archivo comprimido deben estar presentes:

```text
theme.json
style.css
```

Los archivos pueden estar ubicados directamente en la raíz del archivo ZIP:

```text
ocean-mint.zip
├── theme.json
└── style.css
```

O bien dentro de una carpeta contenedora:

```text
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    └── style.css
```

Ambas variantes son compatibles.

Si existen recursos adicionales, la estructura puede verse así:

```text
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    ├── style.css
    ├── background.png
    └── fonts/
        └── MyFont.woff2
```

Se recomienda utilizar caracteres latinos, números, guiones y guiones bajos para el nombre del archivo ZIP.

Por ejemplo:

```text
ocean-mint.zip
dark-glass.zip
baza-emerald.zip
```

### Determinación del ID al importar

Al importar un archivo ZIP, el identificador del tema se genera automáticamente a partir del nombre del archivo ZIP, eliminando caracteres no válidos.

Por ejemplo:

```text
Ocean Mint.zip
```

puede obtener el ID:

```text
ocean-mint
```

Por ello, se aconseja asignar un nombre adecuado al archivo desde el principio.

Esto es importante porque el ID del tema se utiliza con frecuencia en rutas del sistema, nombres de carpetas y en la lógica de selección de temas. Si el archivo ZIP tiene un nombre inadecuado, la carpeta del tema se creará con un identificador confuso o incómodo, lo que complicará su búsqueda, eliminación y actualización posterior.

### Qué sucede después de importar

Tras la importación, 16Launcher por lo general:
* Crea la carpeta del tema en el directorio `themes`;
* Copia los archivos en su interior;
* Reconoce `theme.json` y `style.css`;
* Añade el tema a la lista de temas disponibles.

Si el tema se reconoce correctamente, estará disponible de inmediato para su selección. Si el archivo contiene errores (por ejemplo, falta `style.css` o el JSON está dañado), es posible que el tema no aparezca o se muestre de forma incorrecta.

---

## 5. Instalación manual de un tema

También se puede instalar un tema sin recurrir a la importación ZIP.

Para ello:

1. Cree una carpeta independiente para el tema.
2. Añada `theme.json` y `style.css` dentro de ella.
3. Si es necesario, añada imágenes, fuentes y otros recursos.
4. Copie la carpeta al directorio `themes`.
5. Abra los ajustes de 16Launcher.
6. Vaya a la sección de temas personalizados.
7. Seleccione el tema instalado.

Ejemplo:

```text
themes/
└── ocean-mint/
    ├── theme.json
    ├── style.css
    └── background.png
```

Si la lista de temas ya estaba abierta durante la copia de los archivos, puede ser necesario volver a abrir la pestaña **Launcher** o reiniciar 16Launcher.

### Cuándo es preferible la copia manual sobre la importación ZIP

El método manual es conveniente cuando:
* El tema está en proceso de desarrollo;
* Necesita realizar cambios rápidos sin comprimir el archivo repetidamente;
* Desea crear un tema para un proyecto específico o con recursos locales;
* Se requiere una configuración minuciosa de los archivos dentro de la carpeta.

Al mismo tiempo, la importación ZIP es más cómoda para distribuir y compartir el tema con otros usuarios, ya que todo el conjunto se empaqueta fácilmente en un solo archivo.

### Importancia de una estructura de carpeta correcta

Los archivos dentro del tema deben estar ubicados estrictamente en la carpeta correspondiente y no en cualquier sitio. Si deja los archivos en la raíz de `themes` sin una carpeta contenedora, es probable que 16Launcher no los reconozca. Lo mismo aplica a subdirectorios anidados excesivos si `theme.json` y `style.css` se encuentran más profundos de lo esperado.

La regla fundamental es sencilla: cada tema es una carpeta independiente, y dentro de ella se encuentran `theme.json` y `style.css`.

---

## 6. Crear un tema desde 16Launcher

16Launcher permite crear un nuevo tema directamente desde el menú de ajustes.

Pasos a seguir:

1. Vaya a **Ajustes → Launcher → Tema personalizado**.
2. Haga clic en **Crear tema**.
3. Indique el nombre del tema.
4. 16Launcher creará la carpeta del tema.
5. En la carpeta se generarán los archivos básicos `theme.json` y `style.css`.
6. Haga clic en **Editar CSS** para abrir `style.css` en un editor externo.
7. Realice los cambios necesarios.
8. Guarde el archivo.

Tras modificar el CSS, cambie de tema o vuelva a seleccionarlo para aplicar los cambios.

### Cómo se genera el tema

Al crear un tema, 16Launcher genera automáticamente una carpeta cuyo nombre deriva del título especificado, así como los archivos base. Resulta muy práctico porque:
* No es necesario crear la estructura manualmente;
* Dispone inmediatamente de una plantilla para empezar a trabajar;
* Permite probar ideas con rapidez;
* Facilita guardar el tema y empaquetarlo posteriormente en ZIP.

### Qué hacer tras guardar el CSS

Después de editar el archivo, muchos usuarios esperan que los cambios se apliquen instantáneamente. Sin embargo, en la versión actual de 16Launcher esto no siempre ocurre de forma automática. Por lo tanto, es importante comprender que el editor CSS no funciona como un servicio de vista previa en tiempo real.

### Actualización del tema tras cambiar el CSS

En la versión actual de 16Launcher no existe un rastreo automático en tiempo real de las modificaciones en `style.css`.

Por lo tanto, tras editar el archivo debe:

* Cambiar a otro tema y regresar al actual;
* O bien reiniciar el launcher.

Esto es sumamente importante durante el desarrollo, ya que guardar el archivo en el editor de texto no garantiza por sí solo una actualización inmediata de la interfaz.

Cuando un tema está activo, 16Launcher carga el CSS una sola vez. Si el archivo cambia, el entorno de usuario no siempre detecta que debe recargar los estilos. Por ello, para un desarrollo cómodo recuerde este ciclo:
1. Editar el CSS;
2. Guardar el archivo;
3. Cambiar de tema o reiniciar la aplicación;
4. Comprobar el resultado.

### Prácticas recomendadas de desarrollo

En las etapas iniciales de trabajo conviene:
* Realizar pequeños cambios;
* Comprobar el resultado tras cada guardado;
* Aplicar un estilo a la vez;
* Utilizar un conjunto mínimo de selectores;
* Evitar reescrituras globales drásticas que puedan romper la interfaz.

---

## 7. Identificador y nombre visible del tema

Cada tema posee dos nombres diferentes:

1. **ID del tema**: Nombre técnico de la carpeta;
2. **Nombre del tema**: Nombre que se muestra al usuario.

Estos valores cumplen propósitos distintos y no deben tratarse como si fueran lo mismo.

### 7.1. ID del tema

El ID es el nombre de la carpeta del tema en el disco.

Ejemplo:

```text
ocean-mint/
```

donde `ocean-mint` es el ID del tema.

Reglas recomendadas:

* Utilizar letras latinas;
* Utilizar números si es necesario;
* Utilizar `-` y `_`;
* No utilizar espacios;
* No utilizar caracteres especiales;
* De preferencia utilizar minúsculas;
* Usar un nombre corto y claro.

Opciones recomendadas:

```text
ocean-mint
dark-glass
baza-emerald
my-theme
theme_01
```

Opciones no recomendadas:

```text
¡Mi tema!
theme 1
Cool Theme (final)
tema-nuevo
```

Al crear un tema mediante el botón **Crear tema**, 16Launcher genera automáticamente el ID basándose en el nombre introducido.

Por ejemplo:

```text
Ocean Mint
```

se transforma en:

```text
ocean-mint
```

Al importar un archivo ZIP, el identificador se forma a partir del nombre del archivo ZIP.

### 7.2. Nombre visible

El nombre visible se establece en el campo `name` del archivo `theme.json`.

A diferencia del ID, este nombre está destinado directamente al usuario.

En él se puede utilizar:
* Caracteres cirílicos u otros alfabetos;
* Espacios;
* Letras mayúsculas;
* Símbolos especiales;
* Otros caracteres soportados por UTF-8.

Ejemplo:

```json
{
  "name": "Océano Esmeralda",
  "author": "BAZA",
  "description": "Tema verde turquesa para 16Launcher",
  "version": "1.0"
}
```

En este caso:
* El ID del tema puede ser `ocean-mint`;
* El nombre visible será `Océano Esmeralda`.

### Por qué es importante diferenciar entre ID y Nombre

Esta distinción es crítica al publicar temas, compartirlos entre usuarios y darles mantenimiento. La carpeta en el disco debe ser adecuada para el sistema, mientras que el nombre visible debe ser claro e intuitivo para las personas.

Por ejemplo, un directorio en el disco puede llamarse `dark-glass`, pero en la interfaz se le puede mostrar al usuario como **Cristal Oscuro**, **Vidrio Nocturno** o **Midnight Glass**. Esto hace que el tema sea más estético sin comprometer la estructura técnica.

---

## 8. Formato de `theme.json`

El archivo `theme.json` contiene los metadatos del tema.

Ejemplo mínimo:

```json
{
  "name": "Mi Tema",
  "author": "Tu Nombre",
  "description": "Descripción breve del tema",
  "version": "1.0"
}
```

Campos soportados:

| Campo | Propósito |
| --- | --- |
| `name` | Nombre del tema en la interfaz |
| `author` | Autor del tema |
| `description` | Descripción breve |
| `version` | Versión del tema |

Todos los campos son opcionales. Sin embargo, se recomienda incluir al menos `name`, `author`, `description` y `version`, especialmente si el tema se va a distribuir.

Si `name` no está especificado o está vacío, la interfaz puede mostrar en su lugar el nombre de la carpeta del tema.

### Qué son los metadatos del tema

El archivo `theme.json` no sirve únicamente para mostrar información atractiva. También actúa como la ficha descriptiva del tema utilizada por la interfaz para su identificación y gestión. Si el tema se comparte entre usuarios, es de gran utilidad que cada archivo contenga metadatos claros: nombre, autor, versión y descripción breve.

### Versión del tema

Para la versión se recomienda utilizar un formato claro:

```text
1.0
```

o bien:

```text
1.2.0
```

Al realizar cambios significativos en el tema, se aconseja incrementar el número de versión para que los usuarios puedan diferenciar fácilmente la nueva versión de las anteriores.

Esto es de vital importancia si el tema se descarga, actualiza o comparte entre varios usuarios. Un formato de versiones coherente permite rastrear mejor los cambios, comparar actualizaciones y saber si el tema es compatible con la versión actual del launcher.

### Codificación del archivo

`theme.json` debe guardarse en codificación **UTF-8**.

Esto es imprescindible si se utilizan caracteres especiales, tildes o alfabetos no latinos. Una codificación incorrecta provocará que el nombre, el autor o la descripción se muestren como caracteres illegibles.

Los problemas de UTF-8 suelen ocurrir si el archivo se guarda en ANSI, UTF-16 u otra codificación, resultando en:
* Sustitución de caracteres por símbolos extraños;
* Cadenas illegibles;
* Nombres distorsionados;
* Errores durante la carga.

Por ello, antes de publicar un tema, asegúrese siempre de que el archivo esté abierto y guardado en UTF-8.

---

## 9. Formato de `style.css`

La configuración principal del aspecto visual del tema se realiza en el archivo `style.css`.

Es un archivo CSS estándar, por lo que para crear un tema puede utilizar propiedades CSS comunes, selectores, variables, gradientes, imágenes, fuentes y cualquier otra característica de CSS soportada por la interfaz de 16Launcher.

Ejemplo básico:

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

### Por qué el CSS del tema debe llamarse `style.css`

Porque 16Launcher espera exactamente ese nombre de archivo como fuente principal de los estilos del usuario. Dentro de él se definen las reglas que sobrescribirán el diseño predeterminado.

### Cómo trabajar con CSS en un tema

En el tema puede utilizar:
* Selectores de clases;
* Variables CSS;
* Pseudoclases;
* `background`, `color`, `border`, `border-radius`, `opacity`, `box-shadow`;
* `url(...)` para imágenes;
* `@font-face` para fuentes personalizadas.

Sin embargo, debe recordar que 16Launcher puede utilizar sus propias clases con una prioridad más alta. Por lo tanto, algunas propiedades pueden requerir `!important` para aplicarse correctamente.

### Uso de `!important`

Los estilos estándar de 16Launcher pueden tener una prioridad mayor que las reglas del tema personalizado.

En tales casos, puede ser necesario recurrir a `!important`.

Ejemplo:

```css
.glass-panel {
  background: rgba(6, 40, 30, 0.75) !important;
}
```

No aplique `!important` a absolutamente todas las propiedades sin necesidad. Se recomienda comprobar primero si la regla CSS normal se aplica por sí sola.

El uso excesivo de `!important` puede provocar:
* Dificultades para mantener el código;
* Complicaciones al editar estilos posteriormente;
* Conflictos con las actualizaciones de la aplicación;
* Sobrescritura accidental de elementos no deseados.

Por tanto, `!important` debe emplearse únicamente de forma puntual donde exista un conflicto de prioridad real.

---

## 10. Selectores principales de 16Launcher

En los temas se pueden utilizar las siguientes clases y variables CSS:

| Selector | Propósito |
| --- | --- |
| `.glass-panel` | Paneles de cristal principales de la interfaz |
| `.glass-chip` | Pequeñas fichas (chips) e insignias |
| `.interactive-press` | Elementos interactivos y botones |
| `.accent-bg` | Fondo de acento, incluidos algunos botones |
| `.accent-border` | Borde de acento |
| `.accent-chip` | Fichas de acento |
| `.sidebar-icon-active` | Icono activo de la barra lateral |
| `:root` | Elemento raíz para definir variables CSS |
| `--accent-color` | Color de acento principal |

El conjunto de clases disponibles puede evolucionar con el desarrollo de 16Launcher. Por ello, al crear un tema complejo, se aconseja verificar su funcionamiento tras cada actualización del launcher.

### Cómo trabajar con los selectores

Si el tema debe modificar el fondo general de los paneles, conviene utilizar `.glass-panel`. Si necesita destacar un botón, suele bastar con `.interactive-press` o `.accent-bg`. Para personalizar los iconos activos de la barra lateral, use `.sidebar-icon-active`.

### Qué hacer si falta una clase específica

Si no existe una clase concreta para lo que busca, puede recurrir a selectores más generales, pero recuerde que las reglas globales pueden afectar involuntariamente a elementos que no pretendía modificar.

Por ejemplo, puede cambiar el color de todos los botones o modificar el fondo general de todo un panel, pero esto podría influir en varios componentes de la interfaz. Por tanto, para mantener un tema limpio:
* Utilice clases específicas;
* Combine selectores;
* Verifique el resultado visual tras aplicar los estilos;
* Evite intentar "recolorear toda la aplicación" con reglas globales.

### Variables CSS

Las variables se declaran en `:root`:

```css
:root {
  --accent-color: #10b981;
}
```

Resulta sumamente práctico porque:
* Permite cambiar un color en un solo lugar;
* Evita reescribir docenas de reglas;
* Facilita el mantenimiento del tema;
* Permite crear variaciones de paleta rápidamente.

No obstante, no todos los elementos de 16Launcher utilizan exclusivamente una variable. En ocasiones, partes de la interfaz responden directamente a clases y otras a sus propias variables.

---

## 11. Uso de imágenes

Puede añadir sus propias imágenes a la carpeta del tema.

Ejemplo:

```text
ocean-mint/
├── theme.json
├── style.css
└── background.png
```

Posteriormente, puede enlazar la imagen desde `style.css`:

```css
.glass-panel {
  background-image: url(background.png) !important;
  background-size: cover !important;
}
```

La ruta al recurso debe ser **relativa**.

Si la imagen se encuentra en una subcarpeta:

```text
ocean-mint/
├── theme.json
├── style.css
└── images/
    └── background.png
```

utilice:

```css
.glass-panel {
  background-image: url(images/background.png) !important;
}
```

16Launcher procesa las `url(...)` relativas y las convierte en rutas funcionales hacia los recursos del tema.

### Por qué no se deben usar rutas absolutas

Para los archivos locales del tema no utilice rutas absolutas vinculadas a un ordenador específico, como por ejemplo:

```text
C:\Users\Usuario\Desktop\background.png
```

Estas rutas dejarán de funcionar en cuanto transfiera el tema a otro usuario.

Las rutas absolutas:
* Están vinculadas a un equipo concreto;
* Dependen del nombre de usuario del sistema;
* Dependen de la ubicación local de los archivos;
* No se pueden transferir a otro ordenador;
* Rompen la portabilidad del tema.

### Aspectos a considerar al usar imágenes

Al trabajar con imágenes de fondo, conviene recordar:
* El tamaño del archivo no debe ser excesivamente grande;
* Para interfaces adaptativas es mejor usar una resolución adecuada;
* Puede utilizar `background-size: cover` para rellenar el área;
* Es preferible optar por imágenes que armonicen con el estilo general del tema;
* Evite recargar la interfaz con imágenes demasiado complejas detrás de elementos activos.

A menudo es mejor combinar:
* Un fondo semitransparente;
* Un gradiente suave;
* Un patrón o textura sutil;
en lugar de utilizar una imagen demasiado pesada que consuma recursos innecesarios.

---

## 12. Uso de fuentes personalizadas

Puede incluir archivos de fuentes propios en la carpeta del tema.

Ejemplo:

```text
ocean-mint/
├── theme.json
├── style.css
└── fonts/
    └── MyFont.woff2
```

Puede vincular la fuente mediante `@font-face`:

```css
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}
```

Antes de distribuir el tema, asegúrese de que la licencia de la fuente permita incluirla y redistribuirla junto con los archivos del tema.

### Por qué es importante verificar la licencia

Las fuentes personalizadas aportan mucho al diseño, pero no todas se pueden redistribuir libremente. Si una fuente tiene una licencia comercial restrictiva o prohíbe su inclusión en paquetes de terceros, podría causar problemas legales.

Se recomienda:
* Utilizar fuentes de libre distribución;
* Incluir la licencia en el paquete si así lo exige la tipografía;
* No usar recursos ajenos sin el debido permiso;
* Comprobar previamente los términos de redistribución.

### Cuándo resultan útiles las fuentes

Las fuentes personalizadas destacan especialmente cuando el tema:
* Busca imitar un estilo estético muy concreto;
* Cuenta con un diseño marcadamente decorativo;
* Utiliza encabezados de acento o un lenguaje visual único.

Sin embargo, el diseño puede verse perjudicado si la fuente resulta pesada o difícil de leer en la interfaz del launcher. Mantenga siempre un equilibrio entre decoración y legibilidad.

---

## 13. Recomendaciones para la creación de temas

Al desarrollar un tema, se aconseja seguir estas buenas prácticas:

### Utilice variables CSS

Si el tema utiliza el mismo color en múltiples elementos, defínalo en un solo lugar:

```css
:root {
  --accent-color: #10b981;
}
```

Esto simplifica enormemente cualquier cambio posterior en la paleta de colores.

El uso de variables aporta las siguientes ventajas:
* Permite cambiar un solo valor para actualizar todos los elementos vinculados;
* Facilita la creación de variaciones del tema;
* Ayuda a mantener la coherencia cromática en las reglas;
* Mejora la lectura del código.

### No modifique los archivos del sistema de 16Launcher

Todos los cambios deben permanecer dentro de la propia carpeta del tema.

No intente modificar los archivos de la aplicación principal para lograr cambios visuales.

Esto es crucial por dos motivos:
1. Las modificaciones en archivos del sistema se perderán tras actualizar el launcher;
2. Estas alteraciones suelen comprometer la integridad de la aplicación.

El tema debe estar aislado del código fuente principal y residir en un directorio independiente soportado por 16Launcher.

### Utilice rutas relativas

Para imágenes y fuentes, emplee siempre rutas relativas:

```css
url(images/background.png)
```

en lugar de rutas absolutas locales.

Es una regla fundamental para la distribución. Solo así el tema podrá compartirse y cargarse correctamente en cualquier otro dispositivo.

### Pruebe el tema tras instalarlo

Antes de compartirlo, verifique:
* La correcta visualización de todos los paneles;
* El aspecto de los botones;
* Los elementos activos;
* Las imágenes de fondo;
* Las fuentes personalizadas;
* El comportamiento tras reiniciar la aplicación;
* La integridad del archivo ZIP.

Compruebe no solo que el archivo CSS se aplique, sino que la interfaz se mantenga totalmente legible e integrada. No se limite a verificar un solo botón de color: evalúe el conjunto.

### Evite crear un tema extremadamente complejo desde el inicio

El error más común entre principiantes es intentar crear de golpe un diseño "premium" repleto de efectos complejos, sombras, animaciones y múltiples recursos. Esto suele derivar en:
* Procesos de depuración frustrantes;
* Conflictos severos de CSS;
* Problemas de legibilidad en la interfaz;
* Incompatibilidades tras las actualizaciones del launcher.

Es mejor empezar poco a poco:
* Cambiar el color de acento;
* Ajustar los fondos;
* Garantizar una buena legibilidad;
* Añadir detalles progresivamente.

---

## 14. Cómo compartir un tema

Para distribuir un tema, se recomienda empaquetarlo en un archivo ZIP.

Pasos a seguir:

1. Abra el directorio del tema.
2. Asegúrese de que `theme.json` y `style.css` están presentes.
3. Verifique las imágenes y fuentes adicionales.
4. Cree el archivo ZIP.
5. Comparta el archivo con otros usuarios.

Puede comprimir directamente la carpeta del tema:

```text
ocean-mint.zip
└── ocean-mint/
    ├── theme.json
    ├── style.css
    └── background.png
```

También es válido un archivo comprimido que contenga los archivos directamente en la raíz:

```text
ocean-mint.zip
├── theme.json
└── style.css
```

Se aconseja usar el ID del tema como nombre del archivo ZIP:

```text
ocean-mint.zip
```

Esto facilita la identificación del tema y permite asignar un ID correcto de forma automática al importar.

El destinatario podrá instalar el tema mediante:

**Ajustes → Launcher → Tema personalizado → Importar ZIP**

### Por qué es importante empaquetarlo adecuadamente

El archivo ZIP es el estándar universal para compartir un tema. Permite:
* Agrupar todos los archivos en un único elemento;
* Enviar fácilmente el tema por correo, chat, comunidades o foros;
* Preservar la estructura de carpetas;
* Simplificar la instalación evitando la copia manual de datos.

### Recomendaciones de empaquetado

Antes de enviar el tema:
* Compruebe que no haya archivos innecesarios en el ZIP;
* Asegúrese de que las rutas se mantengan intactas;
* Verifique que no se incluyan archivos temporales del sistema;
* Confirme que el nombre del ZIP sea adecuado;
* Asegúrese de que `theme.json` y `style.css` estén en la ubicación esperada.

---

## 15. Eliminación de un tema

Puede eliminar un tema instalado directamente desde la interfaz de 16Launcher:

1. Abra la lista de temas personalizados.
2. Seleccione el tema.
3. Haga clic en **Eliminar tema**.
4. Confirme la eliminación.

También puede eliminar la carpeta del tema manualmente desde el directorio `themes`.

### Cuándo es útil la eliminación manual

La eliminación manual es conveniente si:
* Desea limpiar rápidamente el directorio de temas;
* El tema ya no se utiliza;
* Necesita resolver un problema con una carpeta dañada;
* Desea eliminar rastros de temas que no aparecen en la interfaz.

Al eliminar manualmente, asegúrese de que:
* La carpeta ya no sea necesaria;
* El tema no esté activo actualmente;
* Tras eliminarlo, la aplicación no requiera reseleccionar el tema activo.

### Temas integrados

Algunos temas suministrados junto con 16Launcher pueden restaurarse automáticamente la próxima vez que se inicie la aplicación.

Por ejemplo, si elimina el tema integrado `example-theme`, el launcher puede volver a copiarlo desde sus recursos internos al detectar que la carpeta ya no existe.

Esto significa que los temas integrados no siempre se comportan como "temas de usuario permanentes", sino que pueden ser regenerados por la aplicación. Por ello, es importante diferenciar entre:
* Temas de usuario instalados manualmente;
* Temas integrados que pueden restaurarse automáticamente.

---

## 16. Problemas frecuentes

### El tema no aparece en la lista

Verifique lo siguiente:
* ¿Existe la carpeta del tema?
* ¿Existe el archivo `theme.json`?
* ¿Existe el archivo `style.css`?
* ¿Están estos archivos ubicados directamente dentro de la carpeta del tema?
* ¿Está el JSON correctamente estructurado?
* ¿Se encuentra la carpeta en el directorio `themes` correcto?

Estructura correcta:

```text
themes/
└── my-theme/
    ├── theme.json
    └── style.css
```

Si falta alguno de los archivos obligatorios, la aplicación no podrá reconocer el tema. Revise minuciosamente la estructura de la carpeta.

### Se asignó un ID incorrecto tras la importación

Al importar un ZIP, el ID se genera a partir del nombre del archivo comprimido.

Por ejemplo:

```text
Mi Tema Genial.zip
```

puede generar un ID distinto al esperado.

Si desea cambiar el ID, renombre el archivo ZIP e impórtelo de nuevo.

A menudo se busca que el ID coincida con el nombre del tema. Esto es posible, pero como el ID se extrae del nombre del archivo ZIP, nombrar adecuadamente el comprimido es la solución más sencilla.

### El CSS no se aplica

Causas posibles:
1. Error de sintaxis en el selector CSS.
2. La regla predeterminada tiene mayor prioridad.
3. No se usó `!important` donde era necesario.
4. No se volvió a seleccionar el tema tras modificar el archivo.
5. Los cambios no se guardaron en el editor.

Tras modificar `style.css`, cambie de tema o reinicie 16Launcher.

Es uno de los problemas más comunes. El usuario edita el CSS pero no observa cambios debido a que:
* El selector no coincide exactamente con el elemento objetivo;
* Una regla antigua sobrescribe la nueva;
* El tema no se ha recargado en la interfaz;
* El editor no guardó el archivo;
* El archivo se guardó en otra codificación o directorio.

### La imagen no se muestra

Verifique:
* ¿Existe el archivo de imagen?
* ¿Es correcta la ruta relativa?
* ¿Coinciden las mayúsculas y minúsculas del nombre del archivo?
* ¿Está el archivo dentro de la carpeta del tema?

Por ejemplo:

```css
background-image: url(images/background.png);
```

requiere la presencia de:

```text
images/background.png
```

Recuerde que algunos sistemas operativos (como Linux) distinguen entre mayúsculas y minúsculas. Si el archivo se llama `Background.png` y en el CSS escribió `background.png`, la imagen no se cargará.

### El tema desapareció tras restablecer los ajustes

Restablecer la configuración puede desmarcar el tema activo y volver al diseño predeterminado.

Sin embargo, la carpeta del tema en el directorio `themes` suele conservarse intacta.

En este caso, simplemente abra la lista de temas personalizados y vuelva a seleccionar su tema.

Restablecer la configuración no implica borrar los archivos del tema; solo reinicia la selección activa y los parámetros de usuario. El tema físico permanece en el disco.

---

## 17. Estructura recomendada para un tema finalizado

Para distribuir un tema, se aconseja estructurarlo de la siguiente manera:

```text
ocean-mint/
├── theme.json
├── style.css
├── images/
│   └── background.png
└── fonts/
    └── MyFont.woff2
```

Ejemplo de `theme.json`:

```json
{
  "name": "Océano Esmeralda",
  "author": "BAZA",
  "description": "Tema verde turquesa para 16Launcher",
  "version": "1.0.0"
}
```

Ejemplo de `style.css`:

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

### Por qué se considera una buena estructura

Porque es:
* Lógica;
* Clara para los usuarios;
* Fácil de distribuir;
* Fácil de editar;
* Permite organizar diferentes tipos de recursos por separado;
* Evita confusiones al importar;
* Cumple con los estándares habituales de paquetes de temas.

---

## 18. Lista de verificación antes de publicar un tema

Antes de compartir su tema con otros usuarios, revise los siguientes puntos:

* [ ] La carpeta del tema tiene un ID adecuado, por ejemplo `my-theme`.
* [ ] El archivo `theme.json` está presente en la carpeta.
* [ ] El archivo `style.css` está presente en la carpeta.
* [ ] `theme.json` está guardado en codificación UTF-8.
* [ ] Se indica un nombre descriptivo en `theme.json`.
* [ ] Se especifica el autor del tema.
* [ ] Se indica la versión del tema.
* [ ] Se incluye una breve descripción.
* [ ] Todas las imágenes y fuentes están dentro de la carpeta del tema.
* [ ] En el CSS se utilizan rutas relativas hacia los recursos.
* [ ] El tema se muestra correctamente en 16Launcher.
* [ ] Todas las reglas CSS necesarias se aplican como se espera.
* [ ] El tema se vuelve a aplicar correctamente tras reiniciar el launcher.
* [ ] El archivo ZIP se importa sin errores mediante **Importar ZIP**.
* [ ] No se han incluido archivos ajenos o innecesarios en el archivo ZIP.

### Por qué es importante revisar antes de publicar

Publicar un tema implica más que guardar y enviar. Un pequeño fallo en la estructura, la ruta, la codificación o los selectores puede hacer que el tema quede inservible. Esta lista ayuda a detectar errores a tiempo y evitar inconvenientes.

---

## 19. Inicio rápido

Puede crear su primer tema en cuestión de minutos.

### Paso 1. Cree el tema

Vaya a:

**Ajustes → Launcher → Tema personalizado → Crear tema**

Escriba un nombre, por ejemplo:

```text
Mi Tema
```

16Launcher creará la carpeta del tema y los archivos necesarios.

### Paso 2. Abra el archivo CSS

Haga clic en **Editar CSS**.

Se abrirá el archivo:

```text
style.css
```

### Paso 3. Añada estilos

Ejemplo:

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

Guarde el archivo.

### Paso 4. Aplique los cambios

Cambie el tema a **Predeterminado** y luego seleccione nuevamente su nuevo tema.

También puede reiniciar 16Launcher por completo.

A continuación, los cambios en el CSS deberían reflejarse en pantalla.

### Paso 5. Prepare el tema para su distribución

Una vez finalizado el diseño, abra la carpeta del tema y comprímala en un archivo ZIP.

Estructura recomendada:

```text
my-theme.zip
└── my-theme/
    ├── theme.json
    └── style.css
```

El archivo ZIP resultante se puede enviar a otros usuarios. Para instalarlo, solo deben usar la opción **Importar ZIP**.

### Cómo enfocar el proceso de creación

Para comenzar, lo más aconsejable es:
* Cambiar el color de acento;
* Oscurecer los paneles o ajustar su transparencia;
* Modificar el border-radius;
* Evaluar la legibilidad de los elementos;
* Avanzar posteriormente hacia efectos más avanzados.

Crear un tema es un proceso de ajuste gradual. Resulta mucho más sencillo lograr excelentes resultados si se empieza por modificaciones básicas y se evalúan visualmente antes de abordar cambios complejos.

---

## 20. Ejemplos de temas preparados

16Launcher puede incluir temas de prueba y demostración de manera predeterminada.

Por ejemplo:

* `example-theme`: Tema púrpura de demostración;
* `baza-emerald`: Tema esmeralda de prueba.

Estos temas pueden tomarse como referencia de estructura y diseño a la hora de crear sus propios temas.

### Por qué es útil examinar los ejemplos

Revisar temas de ejemplo ayuda a:
* Entender cómo se organizan las carpetas;
* Observar reglas CSS típicas;
* Comprender qué estilos encajan bien con la interfaz de 16Launcher;
* Familiarizarse con los nombres de las clases;
* Agilizar el inicio del propio desarrollo.

No obstante, recuerde que los ejemplos no son un estándar inmutable. 16Launcher evoluciona continuamente, por lo que el conjunto de selectores y clases puede variar con el tiempo. Compruebe siempre la compatibilidad con la versión actual de la aplicación.
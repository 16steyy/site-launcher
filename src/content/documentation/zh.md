# 16Launcher 主题

主题就是一个装着 CSS 文件的文件夹，用来改变启动器的外观：颜色、背景、圆角、面板、按钮。下面讲的是安装别人做的主题和自己制作主题所需要知道的全部内容。

## 快速上手

1. 打开 **设置 → 启动器 → 自定义主题**，点击 **创建主题**。
2. 输入名称，比如 `我的主题`。启动器会创建一个包含 `theme.json` 和 `style.css` 的文件夹。
3. 点击 **编辑 CSS**，粘贴：

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

4. 保存文件，先选 **默认**，再重新选回你的主题，修改就生效了。
5. 做好之后，把主题文件夹打包成 ZIP 发给朋友，或者上传到[主题目录](/themes/upload)。

下面把这些步骤逐一展开说明。

## 主题由什么组成

至少两个文件：

| 文件 | 内容 |
| --- | --- |
| `theme.json` | 名称、作者、描述和版本 |
| `style.css` | 修改界面的样式 |

旁边还可以放图片和字体：

```text
my-theme/
├── theme.json
├── style.css
├── background.png
└── fonts/
    └── MyFont.woff2
```

主题不会替换界面，而是叠加在默认样式之上。它改不了启动器的布局：面板可以换颜色，按钮却不能挪位置。

## 主题存放位置

| 系统 | 文件夹 |
| --- | --- |
| Windows | `%APPDATA%\16Launcher\themes\` |
| Linux | `~/.local/share/16Launcher/themes/` |
| macOS | `~/Library/Application Support/16Launcher/themes/` |

最简单的办法是在启动器里直接打开：**设置 → 启动器 → 自定义主题 → 打开主题文件夹**。

每个主题有自己的文件夹，文件直接放在里面：

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

如果 `theme.json` 和 `style.css` 直接放在 `themes/` 里，或者多套了一层文件夹，启动器就找不到这个主题。

## 启用主题

1. 打开 **设置** → **启动器** 标签页。
2. 在 **个性化** 部分打开 **自定义主题**。
3. 从列表中选择主题。

主题会立即生效并被记住，重启后不用重新选择。想恢复原样，选 **默认** 即可，主题文件夹不会被删除。

## 安装

### 通过 ZIP 压缩包

1. 打开 **设置 → 启动器 → 自定义主题**。
2. 点击 **导入 ZIP**，选择压缩包。
3. 在列表中选中新主题。

两种打包方式都支持：文件直接放在根目录，或者放在唯一的一个文件夹里。

```text
ocean-mint.zip              ocean-mint.zip
├── theme.json              └── ocean-mint/
└── style.css                   ├── theme.json
                                └── style.css
```

导入时，主题 ID 取自压缩包的文件名。`Ocean Mint.zip` 会变成 `ocean-mint`，所以最好一开始就用小写英文字母、不带空格来命名。

### 手动安装

把主题文件夹复制到 `themes`，然后在设置里选中它。如果复制时主题列表正开着，切换一下标签页或重启启动器。

主题还在制作时，这种方式最方便：直接在文件夹里改文件，不用每次重新打包。

## ID 和名称

主题有两个名字，用途不同。

**ID** 是硬盘上的文件夹名，例如 `ocean-mint`。只用小写英文字母、数字、`-` 和 `_`，不要空格和特殊字符。

```text
ocean-mint     ✓
dark-glass     ✓
theme_01       ✓
我的主题!!!     ✗
theme 1        ✗
```

用 **创建主题** 时，ID 由名称生成（`Ocean Mint` → `ocean-mint`）；导入时则取自 ZIP 文件名。

**名称** 是主题列表里显示的内容，由 `theme.json` 的 `name` 字段决定，可以随意写：中文、空格、大写字母都行。文件夹叫 `dark-glass`，在启动器里完全可以显示为「深色玻璃」。

## theme.json

```json
{
  "name": "翡翠海洋",
  "author": "BAZA",
  "description": "一款青绿色调的 16Launcher 主题",
  "version": "1.0.0"
}
```

| 字段 | 含义 |
| --- | --- |
| `name` | 主题列表中显示的名称 |
| `author` | 作者 |
| `description` | 简短描述 |
| `version` | 版本，例如 `1.0` 或 `1.2.0` |

所有字段都是可选的。没有 `name` 时，启动器会显示文件夹名。如果主题要给别人下载，最好全部填写，并在改动较大时提高 `version`。

文件请保存为 **UTF-8**。用其他编码保存的话，名称里的中文会变成乱码。

## style.css

就是普通的 CSS。变量、渐变、`url(...)`、`@font-face`、伪类，以及启动器界面支持的其他写法都能用。

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

### 什么时候需要 !important

启动器内置样式的优先级有时更高，你的规则就会悄无声息地失效。这时加上 `!important`。但别每条都加：先看看不加能不能生效。`!important` 越少，以后越容易弄清某个样式是从哪来的。

### 修改不会立刻显示

启动器只在应用主题时读取一次 `style.css`，之后不会监视这个文件。保存后，先选 **默认** 再选回你的主题，或者重启启动器。

## 选择器和变量

| 选择器 | 作用对象 |
| --- | --- |
| `.glass-panel` | 主要的玻璃面板 |
| `.glass-chip` | 小标签和徽章 |
| `.interactive-press` | 按钮和其他可点击元素 |
| `.accent-bg` | 强调色背景，包括部分按钮 |
| `.accent-border` | 强调色边框 |
| `.accent-chip` | 强调色标签 |
| `.sidebar-icon-active` | 侧边栏中当前激活的图标 |
| `--accent-color` | 主强调色，在 `:root` 中设置 |

从 `--accent-color` 入手最省事：改一行，整个界面的强调色就变了。不过不是所有元素都读取这个变量，有些需要通过类名单独改色。

如果找不到对应的类，可以用范围更大的选择器，但要确认没有误伤其他元素。类名会随启动器更新而变化，复杂的主题在更新后最好重新检查一遍。

## 图片和字体

把文件放进主题文件夹，用相对路径引用：

```css
.glass-panel {
  background-image: url(images/background.png) !important;
  background-size: cover !important;
}
```

启动器会把 `url(images/background.png)` 转换成主题内文件的实际路径。像 `C:\Users\User\Desktop\background.png` 这样的绝对路径只在你自己的电脑上有效，别人那里没有这个文件。

字体通过 `@font-face` 引入：

```css
@font-face {
  font-family: "MyFont";
  src: url(fonts/MyFont.woff2);
}

body {
  font-family: "MyFont", sans-serif;
}
```

几点建议：

- 别往主题里塞 20 MB 的背景图。启动器不会因此更好看，主题倒是会很难下载。
- 如果要分享主题，先确认字体许可允许再分发。
- 文件名区分大小写：在 Linux 上，`Background.png` 和 `background.png` 是两个不同的文件。

## 分享主题

把主题文件夹打包成 ZIP，压缩包名和 ID 保持一致：`ocean-mint.zip`。这样对方通过 **导入 ZIP** 安装后，得到的 ID 和你的一样。

发送前删掉无关的东西：草稿、`.psd` 文件、编辑器留下的临时文件。

### 发布到主题目录

你可以把主题上传到[网站上的主题目录](/themes/upload)，让更多人找到它。需要一个 16Launcher 账号。限制如下：

- 压缩包不超过 5 MB；
- 必须包含 `theme.json` 和 `style.css`；
- 允许的文件类型：`.json`、`.css`、`.png`、`.jpg`、`.jpeg`、`.webp`、`.woff`、`.woff2`、`.ttf`、`.txt`。

上传后主题会进入审核，通常需要 1–2 天。

## 删除主题

在列表中选中主题，点击 **删除主题** 并确认。也可以直接从 `themes` 里删掉它的文件夹。

内置主题（比如 `example-theme`）如果文件夹不见了，启动器会在下次启动时自动恢复。

## 常见问题

### 主题没有出现在列表里

- 主题文件夹里是否同时有 `theme.json` 和 `style.css`？
- 文件是否直接放在主题文件夹里，而不是子文件夹里？
- 主题文件夹是否在 `themes` 之内？
- `theme.json` 是否是合法的 JSON？最后一个字段后面多了逗号是常见错误。

### CSS 没有生效

- 文件保存了吗？
- 保存后有没有重新应用主题（通过 **默认** 切换或重启）？
- 选择器真的匹配到目标元素了吗？
- 是不是内置样式优先级更高？试试 `!important`。

### 图片不显示

确认文件在主题文件夹内、`url(...)` 里用的是相对路径，并且文件名大小写一致。

### ID 不对

ID 取自 ZIP 文件名。给压缩包改个名，再导入一次。

### 重置设置后主题不见了

重置只会取消所选主题，不会删除文件夹。打开主题列表重新选择即可。

## 发布前检查清单

- [ ] 文件夹 ID 使用英文字母、不含空格：`my-theme`
- [ ] 包含 `theme.json` 和 `style.css`
- [ ] `theme.json` 为 UTF-8，填写了 `name`、`author`、`description`、`version`
- [ ] 图片和字体都在主题文件夹内
- [ ] CSS 中的路径全部是相对路径
- [ ] 启动器的每个标签页都显示正常，而不只是首页
- [ ] 重启启动器后主题仍然生效
- [ ] ZIP 能通过 **导入 ZIP** 正常导入
- [ ] 压缩包里没有多余文件

## 示例

启动器自带两个适合入门参考的主题：

- `example-theme`，紫色演示主题；
- `baza-emerald`，翡翠绿测试主题。

打开它们的文件夹，看看文件是怎么组织的。[主题目录](/themes)里还有更多，随便下载一个拆开研究就行。

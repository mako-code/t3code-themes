# Installing the themes

A theme is one `.json` file. T3 Code looks for them in its themes folder:

| | Themes folder |
| --- | --- |
| macOS, Linux | `~/.t3/userdata/themes` |
| Windows | `%USERPROFILE%\.t3\userdata\themes` |

> [!IMPORTANT]
> T3 Code reads at most 32 theme files, the first 32 by name, and ignores the rest. The install script counts what is in the folder, your own themes included, and never goes past the limit.

## The install script (macOS, Linux)

```sh
# the starter set of twelve
curl -fsSL https://raw.githubusercontent.com/mako-code/t3code-themes/main/install.sh | sh

# the themes you name
curl -fsSL https://raw.githubusercontent.com/mako-code/t3code-themes/main/install.sh | sh -s -- hanami tidewater pixel-overworld

# a whole family
curl -fsSL https://raw.githubusercontent.com/mako-code/t3code-themes/main/install.sh | sh -s -- --group pixel
```

From a clone the same script also lists, updates and removes:

```sh
./install.sh --list             # every theme by family; the ones you have are marked
./install.sh --update           # fetch the latest copy of the themes you have
./install.sh --remove hanami    # remove one   (--remove-all: every theme from here)
```

It needs `curl` and touches only its own theme files.

## In the app (any system)

1. Download the files you want from [`themes/`](../themes) (open a file, then **Download raw file**).
2. In T3 Code open **Settings → Appearance → Add theme → Choose files** and select them.

## Windows (PowerShell)

```powershell
$dir = "$env:USERPROFILE\.t3\userdata\themes"; New-Item -ItemType Directory -Force $dir | Out-Null
foreach ($t in 'hanami', 'tidewater') { Invoke-WebRequest "https://raw.githubusercontent.com/mako-code/t3code-themes/main/themes/somnus-$t.json" -OutFile "$dir\somnus-$t.json" }
```

## Switching and going back

Press <kbd>⌘</kbd><kbd>⌥</kbd><kbd>A</kbd> (<kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>A</kbd> on Windows and Linux), or run `t3 theme set somnus-classic`. `t3 theme set t3-chat` brings back the standard look.

## Trouble

- **A theme is missing from the list.** There are more than 32 files in the themes folder; `./install.sh --list` counts them.
- **Something looks off after a T3 Code update.** The themes restyle the app with CSS and were made against the nightly of November 2026. Please [open an issue](https://github.com/mako-code/t3code-themes/issues/new/choose) with a screenshot.
- **The backdrop is too much.** Turn it down in the [Studio](https://mako-code.github.io/t3code-themes/studio/), or switch on *Reduce motion* in your system settings: everything then holds still.
- **The mobile app** has its own themes; these do not apply there.

A theme file is colours and CSS. It holds no script and loads nothing from the network. Every theme is also listed in [`themes.json`](../themes.json) and [`themes.tsv`](../themes.tsv).

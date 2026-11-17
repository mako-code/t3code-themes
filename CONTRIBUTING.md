# Contributing

Thank you for wanting to help. This is an unofficial community project: themes for T3 Code, not T3 Code itself.
Problems with the app belong with [its own repository](https://github.com/pingdotgg/t3code).

## What helps most

- **A theme that is hard to read somewhere.** Say which theme, dark or light, and where; a screenshot settles it.
- **Something a T3 Code update broke.** The themes restyle the app with CSS, so a change in the app can undo part of
  one. Say which version of T3 Code you are on.
- **A theme you would like to see.** A mood, a palette, a scene, a holiday.

[Open an issue](https://github.com/mako-code/t3code-themes/issues/new/choose) for any of these.

## Pull requests

**Please do not edit the theme files.** Everything in `themes/` and `screenshots/` is generated from Somnus, the
private design framework these themes come from, so a hand edit would be overwritten by the next build. Open an issue
that says what you would change and why, and it will be made at the source.

Pull requests are welcome for everything written by hand:

- `README.md` and the other documents
- `install.sh` (POSIX `sh`, no bashisms; it must stay within T3 Code's limit of 32 theme files)
- `scripts/`
- `studio/customize.mjs`, the customizer (the Studio's page, `studio/index.html` and `studio/assets/`, is built from a source that is not in this repository: open an issue and say what you would change)

Before you open one, run what the checks run:

```sh
node scripts/check.mjs            # the themes, the lists, the pictures
node studio/customize.mjs --check # every theme through the customizer
shellcheck -s sh install.sh
```

## Licences

Contributions outside `studio/` are accepted under the [MIT licence](LICENSE). Contributions to `studio/` are
accepted under the Studio's licence, [PolyForm Noncommercial 1.0.0](studio/LICENSE.md). By opening a pull request you
agree to that for what you contribute.

#!/bin/sh
# Somnus themes for T3 Code: install, list, update and remove themes.
# Unofficial: a community project, not affiliated with T3 Code. https://github.com/mako-code/t3code-themes
#
#   ./install.sh                      a starter set: twelve themes from across the families
#   ./install.sh hanami tidewater     the themes you name
#   ./install.sh --group pixel        a whole family
#   ./install.sh --list               every theme by family; the ones you have are marked
#   ./install.sh --update             fetch the latest copy of the themes you have
#   ./install.sh --remove hanami      remove themes        (--remove-all: every theme from this repository)
#   ./install.sh --dir PATH ...       use another themes folder
#
# Without a clone:
#   curl -fsSL https://raw.githubusercontent.com/mako-code/t3code-themes/main/install.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/mako-code/t3code-themes/main/install.sh | sh -s -- hanami tidewater
#
# T3 Code reads at most 32 theme files, the first 32 by name, and ignores the rest. So this script never puts
# more into the folder than T3 Code will show: it counts what is there, yours included, and stops before the limit.
set -eu

REPO="mako-code/t3code-themes"
BASE="${T3CODE_THEMES_BASE:-https://raw.githubusercontent.com/$REPO/${T3CODE_THEMES_REF:-main}}"
LIMIT=32
STARTER="classic hanami tidewater evergreen laserdisc insomnia nocturne obsidian vellum porcelain pixel-overworld orrery"
dest="${T3_THEMES_DIR:-${T3CODE_HOME:-$HOME/.t3}/userdata/themes}"
TAB=$(printf '\t')

die() { printf 'install.sh: %s\n' "$*" >&2; exit 1; }
usage() {
  cat <<'USAGE'
Somnus themes for T3 Code (unofficial)

  install.sh                      a starter set: twelve themes from across the families
  install.sh hanami tidewater     the themes you name
  install.sh --group pixel        a whole family
  install.sh --list               every theme by family; the ones you have are marked
  install.sh --update             fetch the latest copy of the themes you have
  install.sh --remove hanami      remove themes        (--remove-all: every theme from this repository)
  install.sh --dir PATH ...       use another themes folder

T3 Code reads at most 32 theme files. See them all: https://github.com/mako-code/t3code-themes
USAGE
}

# ---- what to do ------------------------------------------------------------------------------------------------
action=install; names=""; groups=""
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --list) action=list ;;
    --update) action=update ;;
    --remove) action=remove ;;
    --remove-all) action=remove-all ;;
    --group) [ $# -ge 2 ] || die "--group needs a family name, e.g. --group pixel"; groups="$groups $2"; shift ;;
    --dir) [ $# -ge 2 ] || die "--dir needs a folder"; dest="$2"; shift ;;
    -*) die "unknown option $1 (try --help)" ;;
    *) names="$names $1" ;;
  esac
  shift
done

# ---- where the themes come from: this clone, or GitHub -----------------------------------------------------------
here=$(cd "$(dirname "$0")" 2>/dev/null && pwd || true)
if [ -n "$here" ] && [ -f "$here/themes.tsv" ] && [ -d "$here/themes" ]; then from_clone=1; else from_clone=0; fi
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT INT TERM
fetch() { # fetch <path in the repository> <file to write>
  if [ "$from_clone" = 1 ]; then cp "$here/$1" "$2"
  else curl -fsSL --retry 2 "$BASE/$1" -o "$2"; fi
}
index="$tmp/themes.tsv" # id, family, dark|light, name, description: one theme a line, tab-separated
fetch themes.tsv "$index" 2>/dev/null || die "could not read the list of themes from $BASE. Check your connection, or clone the repository and run ./install.sh from it."

id_of() { n=${1%.json}; case "$n" in somnus-*) printf '%s' "$n" ;; *) printf 'somnus-%s' "$n" ;; esac; }
known() { awk -F"$TAB" -v id="$1" '$1 == id { ok = 1 } END { exit !ok }' "$index"; }
count() { set -- "$dest"/*.json; [ -e "$1" ] && printf '%s' "$#" || printf 0; }

# ---- list --------------------------------------------------------------------------------------------------------
if [ "$action" = list ]; then
  last=""
  while IFS="$TAB" read -r id family _mode _name about; do
    [ "$family" = "$last" ] || { printf '\n%s\n' "$family"; last="$family"; }
    if [ -f "$dest/$id.json" ]; then mark='*'; else mark=' '; fi
    printf ' %s %-28s %s\n' "$mark" "${id#somnus-}" "$about"
  done < "$index"
  printf '\n* installed in %s (%s of the %s theme files T3 Code reads)\n' "$dest" "$(count)" "$LIMIT"
  exit 0
fi

# ---- remove ------------------------------------------------------------------------------------------------------
if [ "$action" = remove ] || [ "$action" = remove-all ]; then
  if [ "$action" = remove-all ]; then names=$(cut -f1 "$index" | tr '\n' ' '); elif [ -z "$names" ]; then die "name the themes to remove, e.g. --remove hanami"; fi
  n=0
  for name in $names; do
    id=$(id_of "$name")
    if [ -f "$dest/$id.json" ]; then rm -f "$dest/$id.json"; n=$((n + 1)); [ "$action" = remove-all ] || printf 'Removed %s\n' "$id"
    elif [ "$action" = remove ]; then printf 'Not installed: %s\n' "$id"; fi
  done
  printf 'Removed %s theme(s) from %s\n' "$n" "$dest"
  exit 0
fi

# ---- which themes --------------------------------------------------------------------------------------------------
want=""
if [ "$action" = update ]; then
  for f in "$dest"/somnus-*.json; do [ -e "$f" ] || continue; id=$(basename "$f" .json); if known "$id"; then want="$want $id"; fi; done
  [ -n "$want" ] || { printf 'No themes from this repository are installed in %s\n' "$dest"; exit 0; }
else
  for group in $groups; do
    more=$(awk -F"$TAB" -v g="$group" 'tolower($2) == tolower(g) { printf "%s ", $1 }' "$index")
    [ -n "$more" ] || die "no family called \"$group\". The families: $(cut -f2 "$index" | awk '!seen[$0]++' | tr '\n' ' ')"
    want="$want $more"
  done
  if [ -z "$names" ] && [ -z "$groups" ]; then names="$STARTER"; fi
  for name in $names; do
    id=$(id_of "$name")
    known "$id" || die "no theme called \"$name\". See them all with --list, or at https://github.com/$REPO#the-themes"
    want="$want $id"
  done
fi

# ---- room for them? T3 Code reads only the first $LIMIT files ------------------------------------------------------------
mkdir -p "$dest"
others=0; new=0
for f in "$dest"/*.json; do [ -e "$f" ] || continue; case " $want " in *" $(basename "$f" .json) "*) ;; *) others=$((others + 1)) ;; esac; done
for id in $want; do new=$((new + 1)); done
if [ $((others + new)) -gt "$LIMIT" ]; then
  printf 'T3 Code reads at most %s theme files and ignores the rest.\n' "$LIMIT" >&2
  printf 'There are %s other theme file(s) in %s, and this would add %s: %s in all.\n' "$others" "$dest" "$new" "$((others + new))" >&2
  printf 'Nothing was changed. Name fewer themes, or make room first:\n  --list         shows what is installed\n  --remove NAME  removes one\n  --remove-all   removes every theme from this repository\n' >&2
  exit 1
fi

# ---- install: each file is written under another name and moved into place, so T3 Code never reads half a file ------
n=0
for id in $want; do
  part="$dest/.$id.part$$"
  fetch "themes/$id.json" "$part" 2>/dev/null || { rm -f "$part"; die "could not fetch $id"; }
  grep -q '"colors"' "$part" || { rm -f "$part"; die "$id did not arrive as a theme file; nothing was installed for it"; }
  mv -f "$part" "$dest/$id.json"
  n=$((n + 1))
  printf 'Installed %s\n' "$id"
done
printf '\n%s theme(s) in %s (%s of the %s theme files T3 Code reads).\n' "$n" "$dest" "$(count)" "$LIMIT"
first=$(printf '%s' "$want" | awk '{ print $1 }')
printf 'Pick one in T3 Code: Settings > Appearance, or Cmd+Option+A (Ctrl+Alt+A).\n'
printf 'Or from a terminal:  t3 theme set %s\n' "$first"
printf 'Make one yours:      https://mako-code.github.io/t3code-themes/\n'

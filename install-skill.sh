#!/bin/sh
# Installs jadis-official, Jadis's skill for coding agents (Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot,
# OpenCode, and any agent that reads Agent Skills). It asks where, then copies the skill's folder there, or links it to
# a clone of the repository so that `git pull` updates it.
#
#   curl -fsSL https://raw.githubusercontent.com/bioleyl/jadis/main/install-skill.sh | sh
#   sh install-skill.sh                       from a clone of the repository
#   sh install-skill.sh --help                the options, to install without questions
#
# JADIS_SKILL_SOURCE installs from a folder that holds the skill, instead of this clone or a download: for a test.
set -eu

skill="jadis-official"
repository="bioleyl/jadis"
skill_path="plugins/$skill/skills/$skill"
newline='
'

usage() {
  cat <<EOF
Installs $skill, Jadis's skill for coding agents.

Usage: install-skill.sh [options]

With no --target, it asks where to install. Options:
  -t, --target WHERE   Where to install; repeat it for several places. WHERE is one of:
                         agents          ~/.agents/skills, the shared folder (Codex and other agents)
                         claude          ~/.claude/skills (Claude Code)
                         project-agents  .agents/skills of the project (Codex, Cursor, Gemini CLI, Copilot, OpenCode...)
                         project-claude  .claude/skills of the project (Claude Code)
                         a folder        any folder that holds skills, written with a slash: ~/.cursor/skills, ./skills
  -p, --project DIR    The project for project-agents and project-claude
                       (default: the git repository around the current folder, else the current folder)
  -r, --ref REF        The branch or tag of $repository to download (default: main), such as core-v<version>
  -l, --link           Link to this clone instead of copying: git pull then updates the skill
  -y, --yes            Replace an installed copy without asking
  -h, --help           This help

The skill goes in <folder>/$skill. To remove it, delete that folder.
In Claude Code, the plugin updates itself instead:
  /plugin marketplace add $repository
  /plugin install $skill@jadis
EOF
}

die() {
  printf 'install-skill: %s\n' "$1" >&2
  exit 1
}

# pretty writes a path with ~ for the home folder.
pretty() {
  case $1 in
    "$HOME"/*) printf '~%s' "${1#"$HOME"}" ;;
    *) printf '%s' "$1" ;;
  esac
}

# absolute turns a leading ~ into the home folder, and a relative path into one from the current folder.
absolute() {
  case $1 in
    "~") printf '%s' "$HOME" ;;
    "~/"*) printf '%s/%s' "$HOME" "${1#"~/"}" ;;
    /*) printf '%s' "$1" ;;
    *) printf '%s/%s' "$PWD" "${1#./}" ;;
  esac
}

# ask prints a question and reads the answer from the terminal, which stays free when the script comes through a pipe.
ask() {
  printf '%s' "$1" >/dev/tty
  answer=""
  IFS= read -r answer </dev/tty || true
}

# can_ask says whether a terminal can answer. A subshell: a redirection that fails on `:` stops the whole shell.
can_ask() {
  (: </dev/tty) 2>/dev/null
}

# append_line adds a line to the list held by the variable named first.
append_line() {
  eval "current=\${$1}"
  if [ -z "$current" ]; then
    eval "$1=\$2"
  else
    eval "$1=\${$1}\$newline\$2"
  fi
}

# each_line calls a function with each line of a list, in the current shell: a failure stops the script.
each_line() {
  each_list=$1
  each_action=$2
  saved_ifs=$IFS
  IFS=$newline
  set -f
  for each_item in $each_list; do
    IFS=$saved_ifs
    "$each_action" "$each_item"
  done
  set +f
  IFS=$saved_ifs
}

# --- Options ---

targets=""
project=""
ref=""
link=false
assume_yes=false

while [ $# -gt 0 ]; do
  case $1 in
    -t | --target)
      [ $# -ge 2 ] || die "$1 needs a value"
      append_line targets "$2"
      shift 2
      ;;
    -p | --project)
      [ $# -ge 2 ] || die "$1 needs a value"
      project=$2
      shift 2
      ;;
    -r | --ref)
      [ $# -ge 2 ] || die "$1 needs a value"
      ref=$2
      shift 2
      ;;
    -l | --link)
      link=true
      shift
      ;;
    -y | --yes)
      assume_yes=true
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

# --- The skill's source: a folder given, this clone, or a download ---

workdir=""
cleanup() {
  if [ -n "$workdir" ]; then
    rm -rf "$workdir"
  fi
}
trap cleanup EXIT
trap 'exit 1' INT TERM

clone_root() {
  case $0 in
    */install-skill.sh | install-skill.sh) ;;
    *) return 1 ;;
  esac
  root=$(cd "$(dirname "$0")" && pwd) || return 1
  [ -f "$root/$skill_path/SKILL.md" ] || return 1
  printf '%s' "$root"
}

fetch() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$1"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$1"
  else
    die "curl or wget is needed to download the skill"
  fi
}

# download unpacks the repository at a ref into a folder, and gives the skill's folder in it.
download() {
  command -v tar >/dev/null 2>&1 || die "tar is needed to unpack the skill"
  printf 'Downloading %s from %s (%s)...\n' "$skill" "$repository" "$1" >&2
  fetch "https://codeload.github.com/$repository/tar.gz/$1" | tar -xzf - -C "$2" \
    || die "could not download $repository at $1"
  found=$(find "$2" -path "*/$skill_path/SKILL.md" | head -n 1)
  [ -n "$found" ] || die "$repository at $1 holds no $skill skill"
  dirname "$found"
}

local_root=""
if [ -n "${JADIS_SKILL_SOURCE:-}" ]; then
  source_dir=$(cd "$JADIS_SKILL_SOURCE" && pwd) || die "no such folder: $JADIS_SKILL_SOURCE"
  [ -f "$source_dir/SKILL.md" ] || die "$JADIS_SKILL_SOURCE holds no SKILL.md"
elif [ -z "$ref" ] && local_root=$(clone_root); then
  source_dir="$local_root/$skill_path"
else
  local_root=""
  [ "$link" = false ] || die "--link needs the script run from a clone of $repository, without --ref"
  workdir=$(mktemp -d)
  source_dir=$(download "${ref:-main}" "$workdir")
fi

version=$(sed -n 's/.*`@jadis\/core@\([0-9][^`]*\)`.*/\1/p' "$source_dir/SKILL.md" | head -n 1)

# --- Where: the questions, unless --target said it ---

project_root() {
  if [ -n "$project" ]; then
    (cd "$(absolute "$project")" 2>/dev/null && pwd) || die "no such project folder: $project"
    return
  fi
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

choose_targets() {
  can_ask || die "no terminal to ask where: pass --target (see --help)"
  here=$(project_root)
  cat >/dev/tty <<EOF

Install $skill${version:+, for @jadis/core $version}. Where?

  For you, in every project:
    1) ~/.agents/skills   the shared folder: Codex, and other agents that read it
    2) ~/.claude/skills   Claude Code
  For the project $(pretty "$here"), for everyone who clones it:
    3) .agents/skills     the shared folder: Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode...
    4) .claude/skills     Claude Code
  Elsewhere:
    5) another folder that holds skills (~/.cursor/skills, ~/.gemini/skills...)

EOF
  ask "Choose one or more, separated by spaces [1]: "
  set -f
  for choice in ${answer:-1}; do
    case $choice in
      1) append_line targets agents ;;
      2) append_line targets claude ;;
      3) append_line targets project-agents ;;
      4) append_line targets project-claude ;;
      5)
        ask "The folder: "
        [ -n "$answer" ] || die "no folder given"
        append_line targets "$(absolute "$answer")"
        ;;
      *) die "no choice $choice" ;;
    esac
  done
  set +f
  if [ -n "$local_root" ] && [ "$link" = false ]; then
    ask "Copy the skill, or link it to this clone so that git pull updates it? [C/l]: "
    case $answer in
      l | L) link=true ;;
      *) ;;
    esac
  fi
}

[ -n "$targets" ] || choose_targets

# folder_of gives the folder that holds skills for a target.
folder_of() {
  case $1 in
    agents) printf '%s/.agents/skills' "$HOME" ;;
    claude) printf '%s/.claude/skills' "$HOME" ;;
    project-agents)
      root=$(project_root) || exit 1
      printf '%s/.agents/skills' "$root"
      ;;
    project-claude)
      root=$(project_root) || exit 1
      printf '%s/.claude/skills' "$root"
      ;;
    */* | "~"*) absolute "$1" ;;
    *) die "unknown target: $1 (see --help)" ;;
  esac
}

# Every target is checked before anything is written.
folders=""
add_folder() {
  folder=$(folder_of "$1") || exit 1
  append_line folders "$folder"
}
each_line "$targets" add_folder

# --- Install ---

# keep_existing says whether an installed copy stays: --yes, or a yes to the question, replaces it.
keep_existing() {
  if [ ! -e "$1" ] && [ ! -L "$1" ]; then
    return 1
  fi
  if [ "$assume_yes" = true ]; then
    return 1
  fi
  can_ask || die "$(pretty "$1") exists: pass --yes to replace it"
  ask "$(pretty "$1") exists. Replace it? [Y/n]: "
  case $answer in
    n | N) return 0 ;;
    *) return 1 ;;
  esac
}

install_into() {
  destination="$1/$skill"
  case $destination in
    /*/"$skill") ;;
    *) die "refusing to write $destination" ;;
  esac
  if [ "$destination" = "$source_dir" ]; then
    printf '  %s is the source itself: left as it is\n' "$(pretty "$destination")"
    return
  fi
  if keep_existing "$destination"; then
    printf '  %s kept as it was\n' "$(pretty "$destination")"
    return
  fi
  mkdir -p "$1"
  rm -rf "$destination"
  if [ "$link" = true ]; then
    ln -s "$source_dir" "$destination"
    printf '  %s -> %s\n' "$(pretty "$destination")" "$(pretty "$source_dir")"
    return
  fi
  cp -R "$source_dir" "$destination"
  printf '  %s\n' "$(pretty "$destination")"
}

printf '\nInstalling %s%s:\n' "$skill" "${version:+ (@jadis/core $version)}"
each_line "$folders" install_into

cat <<EOF

Agents load it at their next session, whenever the code uses @jadis/core.
In Claude Code, the plugin updates itself instead: /plugin marketplace add $repository, then /plugin install $skill@jadis
EOF

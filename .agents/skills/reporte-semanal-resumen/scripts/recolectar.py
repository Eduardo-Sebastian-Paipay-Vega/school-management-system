"""Collect local Git evidence for a weekly report without printing emails.

Usage: python recolectar.py --since 2026-11-01 --until 2026-11-07 [--author "Name"] [--ref dev]
Read-only: does not fetch, write files, or contact external services.
"""
import argparse
import subprocess
import sys


def git(*args):
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True, encoding="utf-8", errors="replace").stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--since", required=True, help="Inclusive date, YYYY-MM-DD")
    parser.add_argument("--until", required=True, help="Inclusive date, YYYY-MM-DD")
    parser.add_argument("--author", help="Git author name; defaults to git config user.name")
    parser.add_argument("--ref", default="HEAD", help="Existing Git ref to inspect (default: HEAD)")
    args = parser.parse_args()

    author = args.author or git("config", "user.name").strip()
    if not author:
        parser.error("No hay autor configurado; indica --author explícitamente.")
    git("rev-parse", "--verify", args.ref)
    records = git("log", args.ref, "--no-merges", f"--author={author}", f"--since={args.since} 00:00:00", f"--until={args.until} 23:59:59", "--date=short", "--format=@@%h%x1f%ad%x1f%s", "--name-only")

    print(f"AUTOR: {author}")
    print(f"PERIODO: {args.since} a {args.until}")
    print(f"REF: {args.ref}")
    count = 0
    for block in records.split("@@"):
        lines = [line for line in block.strip().splitlines() if line.strip()]
        if not lines:
            continue
        fields = lines[0].split("\x1f", 2)
        if len(fields) != 3:
            continue
        short_hash, date, subject = fields
        paths = sorted(set(lines[1:]))
        print(f"\n{date} {short_hash} {subject}")
        for path in paths:
            print(f"  {path}")
        count += 1
    print(f"\nCOMMITS: {count}")
    print("ÁRBOL SIN CONFIRMAR:")
    status = git("status", "--short")
    print(status if status.strip() else "limpio")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        detail = error.stderr.strip() if error.stderr else ""
        print(f"Error al consultar Git: {detail or error}", file=sys.stderr)
        raise SystemExit(2)

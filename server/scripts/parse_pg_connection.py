#!/usr/bin/env python3
"""Parse PostgreSQL connection strings for CI diagnostics (never prints passwords)."""

from __future__ import annotations

import re
import sys
import urllib.parse


def parse_connection_string(raw: str) -> dict[str, str]:
    value = (raw or "").strip()
    if not value:
        return {}

    if value.lower().startswith(("postgres://", "postgresql://")):
        parsed = urllib.parse.urlparse(value)
        return {
            "host": parsed.hostname or "",
            "port": str(parsed.port or 5432),
            "database": parsed.path.lstrip("/"),
            "username": urllib.parse.unquote(parsed.username or ""),
            "password_length": str(len(urllib.parse.unquote(parsed.password or ""))),
            "ssl_mode": _ssl_from_query(parsed.query),
            "format": "uri",
        }

    host = _match(value, r"(?i)Host=([^;]+)")
    return {
        "host": host,
        "port": _match(value, r"(?i)Port=([^;]+)") or "5432",
        "database": _match(value, r"(?i)Database=([^;]+)"),
        "username": _match(value, r"(?i)(Username|User ID|Uid)=([^;]+)", group=2),
        "password_length": str(len(_match(value, r"(?i)Password=([^;]*)") or "")),
        "ssl_mode": _match(value, r"(?i)SSL Mode=([^;]+)") or _match(value, r"(?i)sslmode=([^;]+)"),
        "format": "npgsql",
    }


def normalize_for_azure(raw: str) -> str:
    """Convert Render URI / internal hostnames to Npgsql external connection string."""
    value = (raw or "").strip()
    if not value:
        return value

    host = port = database = username = password = ""
    ssl_mode = "Require"

    if value.lower().startswith(("postgres://", "postgresql://")):
        parsed = urllib.parse.urlparse(value)
        host = parsed.hostname or ""
        port = str(parsed.port or 5432)
        database = parsed.path.lstrip("/")
        username = urllib.parse.unquote(parsed.username or "")
        password = urllib.parse.unquote(parsed.password or "")
        query = urllib.parse.parse_qs(parsed.query)
        if query.get("sslmode", [""])[0].lower() == "require":
            ssl_mode = "Require"
    else:
        info = parse_connection_string(value)
        host = info.get("host", "")
        port = info.get("port", "5432")
        database = info.get("database", "")
        username = info.get("username", "")
        password = _match(value, r"(?i)Password=([^;]*)") or ""
        ssl_mode = info.get("ssl_mode") or "Require"

    host = externalize_render_host(host)

    parts = [
        f"Host={host}",
        f"Port={port}",
        f"Database={database}",
        f"Username={username}",
        f"Password={password}",
        f"SSL Mode={ssl_mode}",
    ]
    return ";".join(parts)


def externalize_render_host(host: str) -> str:
    host = (host or "").strip()
    if not host:
        return host
    if host.endswith(".render.com"):
        return host
    if host.startswith("dpg-") and host.endswith("-a") and "." not in host:
        return f"{host}.oregon-postgres.render.com"
    return host


def _ssl_from_query(query: str) -> str:
    if not query:
        return ""
    params = urllib.parse.parse_qs(query)
    return params.get("sslmode", [""])[0]


def _match(value: str, pattern: str, group: int = 1) -> str:
    match = re.search(pattern, value)
    return match.group(group) if match else ""


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: parse_pg_connection.py describe|normalize", file=sys.stderr)
        return 2

    raw = sys.stdin.read()
    command = sys.argv[1]

    if command == "describe":
        info = parse_connection_string(raw)
        for key in ("format", "host", "port", "database", "username", "password_length", "ssl_mode"):
            if info.get(key):
                print(f"{key}={info[key]}")
        return 0

    if command == "normalize":
        print(normalize_for_azure(raw), end="")
        return 0

    print(f"unknown command: {command}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

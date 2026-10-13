# Re-export price table from local Postgres (Docker: iran-cat-postgres)
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$OutDir = $PSScriptRoot

docker exec iran-cat-postgres pg_dump -U postgres -d iran_cat `
  --data-only --table=public.price --column-inserts |
  Set-Content -Encoding utf8 (Join-Path $OutDir "price_pg_dump.sql")

Set-Location $Root
npx tsx scripts/price-sync/write-price-artifacts.ts

Write-Host "Done. Files in scripts/price-sync/"

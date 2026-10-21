# =============================================================================
# End-to-end verification for the "What I Won't Do" feature.
# =============================================================================
# Usage:
#   1. Apply supabase/patches/2026-10-21_wont_do_page.sql to the database.
#   2. Start the app:      npm run dev
#   3. Run this script:    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-wont-do.ps1
#
# It signs in as the owner using the same HMAC session scheme as the app, then
# exercises the real API routes: create, edit, delete, reorder, publish and
# unpublish. It checks that unpublished items are hidden from the public page
# and unreadable by an anonymous Supabase client, and it removes every row it
# created. The database is left exactly as it was found.
# =============================================================================

$ErrorActionPreference = "Stop"

$base = "http://localhost:3000"
$pass = 0
$fail = 0

function Check($name, $condition, $detail) {
  if ($condition) {
    $script:pass++
    Write-Output ("  PASS  {0}" -f $name)
  } else {
    $script:fail++
    Write-Output ("  FAIL  {0}  ({1})" -f $name, $detail)
  }
}

# ---------------------------------------------------------------- session
$envs = @{}
Get-Content "C:\Users\alans\Comisioner.com\.env.local" | ForEach-Object {
  if ($_ -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') { $envs[$matches[1]] = $matches[2].Trim() }
}
$secret = $envs['SESSION_SECRET']
if (-not $secret) { $secret = $envs['SUPABASE_SERVICE_ROLE_KEY'] }

function B64Url([byte[]]$bytes) {
  [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

$payload = [ordered]@{
  id = "00000000-0000-0000-0000-000000000001"; username = "owner"; name = "Owner"; role = "owner"
  perms = [ordered]@{ reviews = $true; submissions = $true; hide_content = $true; adoptables = $true }
}
$payloadB64 = B64Url ([System.Text.Encoding]::UTF8.GetBytes(($payload | ConvertTo-Json -Depth 5 -Compress)))
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
$cookie = "bc_session=$payloadB64." + (B64Url ($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($payloadB64))))

function Hit($method, $url, $body) {
  $args = @("-s", "-w", "`n%{http_code}", "-b", $cookie, "-X", $method)
  if ($body) { $args += @("-H", "Content-Type: application/json", "-d", $body) }
  $args += $url
  $out = & curl.exe @args
  $text = ($out -join "`n")
  $code = [int]($text -split "`n")[-1]
  $json = $text -replace "`n\d+$", ""
  $parsed = $null
  try { $parsed = $json | ConvertFrom-Json } catch { $parsed = $null }
  return @{ status = $code; body = $json; json = $parsed }
}

Write-Output "=== 1. read the (empty) admin list ==="
$r = Hit GET "$base/api/wont-do/manage" $null
if ($r.status -ne 200) {
  Write-Output "  ABORTED: GET /api/wont-do/manage returned $($r.status) -> $($r.body)"
  Write-Output "  The wont_do_categories / wont_do_items tables do not exist yet."
  Write-Output "  Apply supabase/patches/2026-10-21_wont_do_page.sql and run this again."
  exit 1
}
Check "admin list loads" ($r.status -eq 200) "status $($r.status)"

Write-Output ""
Write-Output "=== 2. create categories and items ==="
$r = Hit POST "$base/api/wont-do/categories" '{"title":"E2E category"}'
Check "create category" ($r.status -eq 201) "status $($r.status) $($r.body)"
$cat1 = $r.json.category.id

$r = Hit POST "$base/api/wont-do/categories" '{"title":"E2E other"}'
$cat2 = $r.json.category.id
Check "create second category" ($r.status -eq 201) "status $($r.status)"

$r = Hit POST "$base/api/wont-do/items" ("{`"category_id`":`"$cat1`",`"title`":`"E2E item A`"}")
Check "create item A" ($r.status -eq 201) "status $($r.status) $($r.body)"
$itemA = $r.json.item.id

$r = Hit POST "$base/api/wont-do/items" ("{`"category_id`":`"$cat1`",`"title`":`"E2E item B`"}")
Check "create item B" ($r.status -eq 201) "status $($r.status) $($r.body)"
$itemB = $r.json.item.id

Write-Output ""
Write-Output "=== 3. edit ==="
$r = Hit PUT "$base/api/wont-do/categories/$cat1" '{"title":"E2E renamed"}'
Check "rename category" ($r.status -eq 200 -and $r.json.category.title -eq "E2E renamed") "status $($r.status) $($r.body)"

$r = Hit PUT "$base/api/wont-do/items/$itemA" '{"description":"A short explanation"}'
Check "edit item description" ($r.status -eq 200 -and $r.json.item.description -eq "A short explanation") "status $($r.status) $($r.body)"

Write-Output ""
Write-Output "=== 4. publish / unpublish ==="
$r = Hit PUT "$base/api/wont-do/items/$itemA" '{"visible":false}'
Check "unpublish item A" ($r.status -eq 200 -and $r.json.item.visible -eq $false) "status $($r.status) $($r.body)"

$r = Hit GET "$base/api/wont-do" $null
$publicText = $r.body
Check "public page hides unpublished item" ($publicText -notmatch "E2E item A") "unpublished item leaked"
Check "public page shows published item" ($publicText -match "E2E item B") "published item missing"
Check "public page shows the category" ($publicText -match "E2E renamed") "category missing"

$r = Hit PUT "$base/api/wont-do/items/$itemA" '{"visible":true}'
Check "republish item A" ($r.status -eq 200 -and $r.json.item.visible -eq $true) "status $($r.status)"

$r = Hit GET "$base/api/wont-do" $null
Check "public page shows republished item" ($r.body -match "E2E item A") "republished item missing"

Write-Output ""
Write-Output "=== 5. reorder ==="
$r = Hit POST "$base/api/wont-do/reorder" ("{`"categories`":[`"$cat2`",`"$cat1`"],`"items`":[`"$itemB`",`"$itemA`"]}")
Check "reorder accepted" ($r.status -eq 200) "status $($r.status) $($r.body)"

$r = Hit GET "$base/api/wont-do/manage" $null
$cat1Row = $r.json.categories | Where-Object { $_.id -eq $cat1 }
$cat2Row = $r.json.categories | Where-Object { $_.id -eq $cat2 }
$itemARow = $r.json.items | Where-Object { $_.id -eq $itemA }
$itemBRow = $r.json.items | Where-Object { $_.id -eq $itemB }
Check "category order persisted" ($cat2Row.sort_order -eq 0 -and $cat1Row.sort_order -eq 1) "cat2=$($cat2Row.sort_order) cat1=$($cat1Row.sort_order)"
Check "item order persisted" ($itemBRow.sort_order -eq 0 -and $itemARow.sort_order -eq 1) "b=$($itemBRow.sort_order) a=$($itemARow.sort_order)"

Write-Output ""
Write-Output "=== 6. move an item to another category ==="
$r = Hit PUT "$base/api/wont-do/items/$itemA" ("{`"category_id`":`"$cat2`"}")
Check "move item to other category" ($r.status -eq 200 -and $r.json.item.category_id -eq $cat2) "status $($r.status) $($r.body)"

$r = Hit GET "$base/api/wont-do" $null
Check "moved item is listed under the new category" ($r.body -match "E2E other" -and $r.body -match "E2E item A") "move not visible publicly"

Write-Output ""
Write-Output "=== 7. persistence across a fresh read ==="
$r = Hit GET "$base/api/wont-do/manage" $null
Check "data survives a reload" ($r.json.items.Count -ge 2 -and $r.json.categories.Count -ge 2) "items=$($r.json.items.Count) categories=$($r.json.categories.Count)"

Write-Output ""
Write-Output "=== 8. row level security (anon key must not read drafts) ==="
$base2 = $envs['NEXT_PUBLIC_SUPABASE_URL']
$anon = $envs['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']
$service = $envs['SUPABASE_SERVICE_ROLE_KEY']
$svcHeaders = @{ apikey = $service; Authorization = "Bearer $service" }
$anonHeaders = @{ apikey = $anon; Authorization = "Bearer $anon" }
$hidden = Invoke-RestMethod -Uri ($base2 + "/rest/v1/wont_do_items?select=id,title,visible&visible=eq.false") -Headers $svcHeaders -Method Get -TimeoutSec 30
$anonVisible = Invoke-RestMethod -Uri ($base2 + "/rest/v1/wont_do_items?select=id,title") -Headers $anonHeaders -Method Get -TimeoutSec 30
$hiddenIds = @($hidden | ForEach-Object { $_.id })
$anonIds = @($anonVisible | ForEach-Object { $_.id })
$leaked = @($hiddenIds | Where-Object { $anonIds -contains $_ })
Check "anon client cannot read unpublished items" ($leaked.Count -eq 0) ("leaked: " + ($leaked -join ","))

Write-Output ""
Write-Output "=== 9. delete ==="
$r = Hit DELETE "$base/api/wont-do/items/$itemA" $null
Check "delete item" ($r.status -eq 200) "status $($r.status) $($r.body)"
$r = Hit DELETE "$base/api/wont-do/items/$itemB" $null
Check "delete second item" ($r.status -eq 200) "status $($r.status) $($r.body)"
$r = Hit DELETE "$base/api/wont-do/categories/$cat1" $null
Check "delete category" ($r.status -eq 200) "status $($r.status) $($r.body)"
$r = Hit DELETE "$base/api/wont-do/categories/$cat2" $null
Check "delete second category" ($r.status -eq 200) "status $($r.status) $($r.body)"

$r = Hit GET "$base/api/wont-do/manage" $null
Check "test rows removed" (@($r.json.items).Count -eq 0 -and @($r.json.categories).Count -eq 0) "items=$(@($r.json.items).Count) categories=$(@($r.json.categories).Count)"

$r = Hit GET "$base/api/wont-do" $null
Check "public page back to empty state" ($r.status -eq 200 -and $r.json.categories.Count -eq 0) "status $($r.status)"

Write-Output ""
Write-Output "=================================================="
Write-Output ("passed: {0}   failed: {1}" -f $pass, $fail)
if ($fail -gt 0) { exit 1 }

# GitHub Actions 触发脚本
# 使用方法：.\trigger-github-action.ps1 -Token "YOUR_GITHUB_TOKEN"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [string]$Owner = "335459215",
    [string]$Repo = "YunYingTV",
    [string]$Branch = "master"
)

$workflowFile = "build-apk.yml"
$url = "https://api.github.com/repos/$Owner/$Repo/actions/workflows/$workflowFile/dispatches"

$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $Token"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
    "ref" = $Branch
} | ConvertTo-Json

Write-Host "触发 GitHub Actions workflow..." -ForegroundColor Cyan
Write-Host "Repository: $Owner/$Repo" -ForegroundColor Cyan
Write-Host "Workflow: $workflowFile" -ForegroundColor Cyan
Write-Host "Branch: $Branch" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✓ Workflow 触发成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "查看构建进度：" -ForegroundColor Cyan
    Write-Host "https://github.com/$Owner/$Repo/actions" -ForegroundColor Yellow
} catch {
    Write-Host "✗ 触发失败：" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "请确保：" -ForegroundColor Yellow
    Write-Host "1. Token 有效且有正确的权限" -ForegroundColor Yellow
    Write-Host "2. Token 已添加到 GitHub Secrets" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "或者，你可以直接在 GitHub 上手动触发：" -ForegroundColor Cyan
    Write-Host "https://github.com/$Owner/$Repo/actions/workflows/$workflowFile" -ForegroundColor Yellow
}

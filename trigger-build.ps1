# GitHub Actions Workflow 触发脚本
# 使用方法：.\trigger-build.ps1

$owner = "335459215"
$repo = "YunYingTV"
$workflow = "build-apk.yml"
$branch = "master"

# 提示用户输入 Token
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "GitHub Actions 构建触发器" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请输入 GitHub Personal Access Token:" -ForegroundColor Yellow
Write-Host "获取 Token: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "需要的权限：repo, workflow" -ForegroundColor Gray
Write-Host ""

$token = Read-Host "Token" | ForEach-Object { $_.Trim() }

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Token 不能为空！" -ForegroundColor Red
    exit 1
}

# 构建请求体
$body = @{
    ref = $branch
    inputs = @{
        version_increment = "patch"
        create_release = "true"
    }
} | ConvertTo-Json -Depth 10

# API 端点
$uri = "https://api.github.com/repos/$owner/$repo/actions/workflows/$workflow/dispatches"

# 发送请求
Write-Host ""
Write-Host "📤 正在触发构建..." -ForegroundColor Cyan
$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $token"
    "X-GitHub-Api-Version" = "2022-11-28"
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "✅ 构建触发成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 构建信息:" -ForegroundColor Cyan
    Write-Host "  仓库：$owner/$repo" -ForegroundColor White
    Write-Host "  分支：$branch" -ForegroundColor White
    Write-Host "  版本递增：patch (+0.0.1)" -ForegroundColor White
    Write-Host "  创建 Release: true" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 查看构建进度:" -ForegroundColor Cyan
    Write-Host "  https://github.com/$owner/$repo/actions" -ForegroundColor Blue
    Write-Host ""
    Write-Host "⏱️  预计需要 10-15 分钟完成构建" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "❌ 触发失败！" -ForegroundColor Red
    Write-Host "错误信息：$($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "详情：$($errorDetail.message)" -ForegroundColor Red
    }
    
    exit 1
}

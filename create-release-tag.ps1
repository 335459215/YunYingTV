# 创建并推送 tag 以触发 GitHub Actions 构建
# 使用方法：.\create-release-tag.ps1

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
$tagName = "v$version"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  创建 Release Tag" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 当前版本：$version" -ForegroundColor Yellow
Write-Host "🏷️  Tag 名称：$tagName" -ForegroundColor Yellow
Write-Host ""

# 检查 tag 是否已存在
$existingTag = git tag -l $tagName
if ($existingTag) {
    Write-Host "⚠️  Tag 已存在，删除旧的 tag..." -ForegroundColor Yellow
    git tag -d $tagName
    git push origin :refs/tags/$tagName
}

# 创建新 tag
Write-Host "✅ 创建新 tag: $tagName" -ForegroundColor Green
git tag -a $tagName -m "Release version $version"

# 推送 tag
Write-Host "📤 推送 tag 到 GitHub..." -ForegroundColor Green
git push origin $tagName

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Tag 创建成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 查看构建进度:" -ForegroundColor Yellow
Write-Host "   https://github.com/335459215/YunYingTV/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  构建时间：约 10-15 分钟" -ForegroundColor Yellow
Write-Host "📦 APK 将自动发布到 Releases 页面" -ForegroundColor Yellow

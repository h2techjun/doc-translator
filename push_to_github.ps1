# GitHub Push Script (Auto-Config Version)
$ErrorActionPreference = "Continue"

Write-Host "🔧 Configuring Git User..."
git config --global user.email "deploy@doctranslator.com"
git config --global user.name "Deploy User"

Write-Host "🚀 Initializing Git Repository..."
git init
git add .
git commit -m "Release: Phase 1 Complete (Premium UI, Ad Engine, Admin)"
git branch -M main

Write-Host "🔗 Connecting to Remote..."
# Remove existing origin if any
git remote remove origin 2> $null
git remote add origin https://github.com/h2techjun/doc-translator.git

Write-Host "⬆️ Pushing to GitHub..."
git push -u origin main

Write-Host "✅ Done! Go to Vercel and click [Deploy] again."
Read-Host -Prompt "Press Enter to exit"

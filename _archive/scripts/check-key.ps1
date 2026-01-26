
$apiKey = "AIzaSyC8wF_EzQMNGMFHI8RhMZwBgX5WPCfjG5g"
$uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey"
$body = @{ contents = @( @{ parts = @( @{ text = "Hello" } ) } ) } | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success!"
} catch {
    Write-Host "❌ Failed!"
    Write-Host $_.Exception.Message
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\keong\Desktop\Jack Website\images\teacher\JACK_BG.png")
Write-Output "Width: $($img.Width) Height: $($img.Height)"
$img.Dispose()

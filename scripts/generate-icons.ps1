Add-Type -AssemblyName System.Drawing
$color = [System.Drawing.Color]::FromArgb(93,156,236)
$root = "f:/rams_coding_2/smp_muh_35_new/public"
foreach ($size in 192,512) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.Clear($color)
    $gfx.Dispose()
    $path = Join-Path $root "android-chrome-$size`x$size.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "created $path"
}

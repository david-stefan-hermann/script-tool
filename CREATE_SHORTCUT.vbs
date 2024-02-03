Set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Script-Kiddie.lnk")
oShellLink.TargetPath = WshShell.CurrentDirectory & "\app\setup.bat"
oShellLink.WindowStyle = 1
oShellLink.IconLocation = WshShell.CurrentDirectory & "\app\media\icon.ico"
oShellLink.Description = "Shortcut to Script Kiddie Script Runner"
oShellLink.WorkingDirectory = WshShell.CurrentDirectory & "\app"
oShellLink.Save
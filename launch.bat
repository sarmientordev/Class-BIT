@echo off
rem Class BIT PC - Lanzador
setlocal
cd /d "%~dp0"
set "APP=cpu"
for %%I in ("%~dp0.") do set "APP=%%~fI"
start "" "%~dp0node_modules\electron\dist\electron.exe" "%APP%"
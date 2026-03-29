@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 正在为指定的游戏文件添加防侧滑返回脚本...
echo.

:: 定义需要处理的文件列表（相对于当前目录）
set "files=0/txz.html 1/huarongdao2.html 2/ygdbns.html 3/zhaobutong.html 4/index.html 5/mufang.html 6/chicangying.html 8/qqq.html 22/index.html 80/index.html 52/index.html 24.html 2048.html brick.html drawball.html flappybird.html gomoku.html hnt.html huarongdao.html lianliankan.html memory.html reversi.html saolei.html snake.html tic.html"

:: 要插入的脚本
set "script=<script>(function(){ history.pushState(null,null,location.href); window.addEventListener('popstate',function(){ history.pushState(null,null,location.href); }); })();</script></body>"

:: 逐个处理
for %%f in (%files%) do (
    if exist "%%f" (
        echo 正在处理: %%f
        powershell -Command "$c = Get-Content '%%f' -Raw -Encoding UTF8; if ($c -notmatch 'history.pushState.*popstate') { $c -replace '</body>', '%script%' | Set-Content '%%f' -Encoding UTF8 -NoNewline; Write-Host '  已添加' } else { Write-Host '  已存在，跳过' }"
    ) else (
        echo 警告: 文件不存在 - %%f
    )
)

echo.
echo 全部完成！按任意键退出...
pause >nul
@echo off
title Ollama Local AI Engine
set OLLAMA_MODELS=G:\My Drive\00_CONTROL_ROOM\AI_Engine\models
echo ============================================
echo   OLLAMA LOCAL AI IS RUNNING
echo   Models are saving to: 
echo   G:\My Drive\00_CONTROL_ROOM\AI_Engine\models
echo ============================================
echo.
echo DO NOT CLOSE THIS WINDOW.
echo KEEP THIS RUNNING IN BACKGROUND.
echo.
ollama serve
pause
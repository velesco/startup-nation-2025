# Fix: Corectat problema de build - import paths pentru ProfilePage

## Problema:
Build-ul failed cu eroarea: "You attempted to import ../../contexts/AuthContext which falls outside of the project src/ directory"

## Cauza:
ProfilePage.js avea căi relative incorecte pentru import-uri care încercau să acceseze fișiere din afara directorului src/

## Soluția:
Corectat toate căile relative în ProfilePage.js:
- `../../contexts/AuthContext` → `../contexts/AuthContext` 
- `../../components/layouts/DashboardLayout` → `../components/layouts/DashboardLayout`
- `../../components/users/IDCardUpload` → `../components/users/IDCardUpload`
- `../../services/api` → `../services/api`

## Impact:
- ✅ Build-ul frontend va funcționa acum fără erori
- ✅ Funcționalitatea OCR buletin rămâne intactă
- ✅ Toate import-urile sunt acum în conformitate cu restricțiile create-react-app

## Pentru Deploy:
Proiectul este acum ready pentru re-deploy cu modificările OCR implementate.

## Fișiere Modificate:
- `frontend/src/pages/ProfilePage.js`

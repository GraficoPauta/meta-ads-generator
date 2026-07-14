# 🚀 Meta Ads Campaign Generator

Generador automático de campañas de Meta Ads con AI para crear copies desde landing pages.

## ✨ Características

- ✅ Generar campañas en 6 pasos
- ✅ Crear 4 copies automáticos desde landing page
- ✅ Seleccionar creatives desde Google Drive
- ✅ Revisar antes de activar
- ✅ Interface web 100% en navegador
- ✅ Sin instalación para usuarios

## 🎯 Uso

1. Abre: `https://meta-ads-generator.vercel.app`
2. Selecciona cuenta publicitaria
3. Completa datos de campaña
4. Configura Ad Set
5. Genera copies desde landing
6. ¡Activa!

## 🔧 Tech Stack

- **Frontend**: HTML5 + CSS3 + Vanilla JS
- **Backend**: Vercel Serverless Functions (Node.js)
- **API**: Claude Anthropic AI
- **Hosting**: Vercel

## 📁 Estructura

```
.
├── public/
│   └── index.html           (Frontend HTML)
├── api/
│   └── generate-copies.js   (Backend API)
├── vercel.json              (Config Vercel)
├── package.json
└── README.md
```

## 🚀 Deploy en Vercel

1. Sube repo a GitHub
2. Conecta a Vercel (vercel.com)
3. Agrega variable de entorno:
   - `ANTHROPIC_API_KEY=sk-ant-xxxxx`
4. Deploy automático

## 📞 Soporte

Si hay errores, revisa:
- Console del navegador (F12)
- Variables de entorno en Vercel
- API Key válida de Claude

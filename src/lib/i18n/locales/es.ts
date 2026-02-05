export const es = {
    badge: "100% Conservación de Formato",
    title: { main: "Formato intacto,", highlight: "Solo cambia el idioma." },
    description: "Traduce documentos con tablas complejas sin perder el diseño.\nLa IA entiende el contexto para una traducción natural.",
    dropzone: { idle: "Arrastra tu archivo aquí", sub: "o haz clic para seleccionar", support: "Soporta DOCX, XLSX, PPTX, HWP" },
    features: {
        compatibility: { title: "Soporte Nativo", desc: "Procesamos archivos Office y HWP directamente sin convertirlos a PDF." },
        format: { title: "Diseño Perfecto", desc: "Tablas y gráficos mantienen su alineación exacta." },
        speed: { title: "Ultrarrápido", desc: "Motor optimizado para procesar archivos grandes en segundos." }
    },
    pricingPage: {
        hero: { title: "ELIGE TU", highlight: "NIVEL DE PODER", subtitle: "Escala tu comunicación global con nuestro motor de traducción AI de alta fidelidad." },
        tiers: {
            guest: { name: "INVITADO", price: "Gratis", desc: "Sin registro", limit: "2pages", button: "Probar modo invitado", features: ["Traducción Word/Excel/PPT", "2pages por doc"] },
            bronze: { name: "BRONCE", price: "Gratis", desc: "Membresía básica", bonus: "BONO DE REGISTRO: 50P", button: "Registrarse gratis", features: ["Soporte comunitario"] },
            silver: { name: "PLATA", priceKRW: "Usuario", priceUSD: "$5.00", desc: "Obtén 50P y mejora", bonus: "50P INSTANTÁNEOS", button: "Cargar 50P", features: ["Insignia verificada", "Procesamiento más rápido"] },
            gold: { name: "ORO", price: "100k+", unit: "KRW", desc: "Pago acumulativo", vip: "ESTADO VIP", button: "Mejora automática", features: ["Máxima prioridad", "Línea de soporte directo"] },
            diamond: { name: "DIAMANTE", price: "Ilimitado", unit: "", desc: "Plan definitivo", vip: "ILIMITADO", button: "Activo", features: ["Sin costo de puntos", "Acceso total"] },
            master: { name: "MAESTRO", price: "Ilimitado", unit: "", desc: "Solo administradores", vip: "GOD MODE", button: "Activo", features: ["Control total", "Traducción sin fin"] }
        },
        policy: {
            title: "Política de puntos y operación",
            pointTitle: "1. Política de puntos",
            pointItems: ["Recompensa de registro: Se otorgan 50P inmediatamente al registrarse.", "Costo base: {base} Puntos por documento ({basePages}page).", "Costo adicional: {extra}P por página a partir de la página {nextPage}.", "Modo invitado: 2page gratis para invitados."],
            adTitle: "2. Política de anuncios y recarga",
            adItems: ["Recarga gratuita: Puedes ganar puntos viendo anuncios si te quedas sin ellos.", "Recompensa: Obtén 5P haciendo clic en [Obtener 5 puntos] en los anuncios.", "Ilimitado: Durante la beta, las recompensas de anuncios son ilimitadas.", "Servicio: Los ingresos por anuncios respaldan los costos del servidor y el motor AI."],
            disclaimer: "* Esta política puede cambiar durante el período beta. Los puntos no son reembolsables."
        },
        features: {
            support: { title: "Soporte global", desc: "Soporte para más de 20 idiomas con IA consciente de la cultura." },
            security: { title: "Seguridad empresarial", desc: "Cifrado de nivel bancario para todos tus documentos." },
            fidelity: { title: "Alta fidelidad", desc: "Conserva todo el formato, gráficos y diagramas." }
        }
    },
    community: {
        title: "Comunidad",
        write: "Escribir",
        tabs: {
            free: "Foro Libre",
            inquiry: "Foro de Consultas",
            notice: "Avisos"
        },
        noPosts: "No hay publicaciones. ¡Sé el primero en publicar!",
        noticeFixed: "Aviso Fijo",
        postedBy: "Por",
        views: "Vistas"
    },
    adReward: {
        title: "¿Has visto el anuncio? ¡Obtén tu recompensa!",
        button: "Obtener 5 Puntos (+5P)",
        loading: "Procesando...",
        success: "¡Felicidades! Se han cargado {points}P."
    },
    pricingRule: {
        title: "Política de puntos",
        base: "{base} Puntos ({basePages}page)",
        extra: "{extra}P/page a partir de la página {nextPage}"
    },
    selector: "Idioma de destino",
    selectorLabel: "Seleccionar idioma de destino",
    button: { translate: "Traducir ahora" },
    time: { estimated: "Tiempo estimado", seconds: "seg" },
    loading: {
        uploading: { title: "Subiendo...", desc: "Enviando documento al servidor seguro." },
        processing: { title: "Traduciendo...", desc: "La IA está analizando y reescribiendo." },
        completed: { title: "¡Listo!", desc: "Su documento está listo para descargar." },
        failed: { title: "Error", desc: "Algo salió mal. Por favor intente de nuevo." },
        success: { title: "¡Éxito!", desc: "Formato conservado al 100%" },
        download: "Descargar archivo traducido"
    },
    nav: {
        community: "Comunidad",
        pricing: "Precios",
        login: "Iniciar sesión",
        signup: "Empieza gratis",
        pointsHold: "Puntos",
        adminDashboard: "Panel de Maestro",
        myHistory: "Mis traducciones",
        betaBenefits: "Beneficios Beta",
        boostTitle: "Carga tus puntos",
        boostDesc: "¿Necesitas más puntos?\n¡Mira un anuncio y obtén 5P!",
        watchAd: "Ver anuncio",
        logout: "Cerrar sesión",
        loggedOut: "Sesión cerrada con éxito.",
        backToUpload: "Volver a subir",
        local: "Subida local",
        cloud: "Nube",
        brandName: "DocTranslation",
        tierBronze: "BRONZE",
        tierSilver: "PLATA",
        tierGold: "ORO",
        tierDiamond: "DIAMANTE",
        tierMaster: "MAESTRO",
        memberLogin: "ACCESSO MIEMBROS",
        driveSelected: "Seleccionado de Drive: {name}",
        translateReady: "Listo para traducir",
        translating: "Traduciendo...",
        translateFailed: "Error de traducción",
    },
    auth: {
        signinTitle: "Iniciar sesión",
        signinDesc: "Comienza tu traducción de documentos rápida e inteligente.",
        emailLabel: "Correo electrónico",
        passwordLabel: "Contraseña",
        emailPlaceholder: "nombre@ejemplo.com",
        passwordPlaceholder: "••••••••",
        guestLogin: "Iniciar como invitado (10P)",
        forgotPassword: "¿Olvidaste tu contraseña?",
        submitLogin: "Iniciar sesión",
        submitSignup: "Crear cuenta",
        toSignup: "Crear una cuenta",
        toSignin: "Iniciar sesión con contraseña",
        social: "Seguridad de nivel empresarial",
        alertUnconfirmed: "Correo electrónico no verificado.",
        alertUnconfirmedDesc: "Por favor, revisa tu bandeja de entrada.",
        btnResend: "Reenviar correo de verificación",
        btnSending: "Enviando...",
        btnLoginOther: "Iniciar sesión con otro ID",
        signupTitle: "Crear cuenta",
        signupDesc: "Revisa el enlace de verificación enviado a tu correo.",
        sentTo: "Enviado a",
        checkEmailTitle: "¡Revisa tu correo!",
        checkEmailDesc: "Hemos enviado un enlace de verificación a",
        backWithEmail: "Volver a introducir el correo",
        alreadyHaveAccount: "¿Ya tienes una cuenta?",
        rememberMe: "Mantener sesión iniciada"
    },
    admin: {
        dashboard: "Panel de control",
        users: "Gestión de usuarios",
        jobs: "Gestión de tareas",
        security: "Seguridad",
        shutdown: "Apagar sistema",
        userManagement: "Gestión de usuarios",
        totalUsers: "Usuarios totales",
        translationJobs: "Estado de tareas de traducción",
        recentActivity: "Registro de actividad reciente",
        banSystem: "Sistema de restricción de acceso",
        banDesc: "Aislar intrusos o resolver malentendidos con privilegios de Maestro.",
        verifying: "Verificando identidad de Maestro..."
    },
    coupons: {
        title: "Canjear cupón",
        desc: "Introduce tu código de promoción y obtén puntos.",
        placeholder: "Introduce el código aquí",
        button: "Reclamar",
        success: "{points}P añadidos!",
        successDesc: "El cupón se ha canjeado correctamente.",
        failedTitle: "Error al canjear",
        errorSystem: "Error del sistema",
        errorSystemDesc: "Por favor, inténtalo de nuevo más tarde."
    },
    reports: {
        title: "Reportar contenido",
        description: "¿Por qué estás reportando este {type}?",
        placeholder: "Por favor, describe el problema...",
        cancel: "Cancelar",
        submit: "Enviar reporte",
        success: "Reporte enviado",
        successDesc: "Gracias por mantener segura nuestra comunidad.",
        errorFailed: "Error al reportar",
        errorSystem: "Error del sistema"
    }
};

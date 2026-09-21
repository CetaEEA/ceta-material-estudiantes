// ============================================================
// CETA
// PORTAL DE MATERIAL ACADÉMICO - DOCENTE
// ============================================================


let perfilDocente = null;

let semestreDocenteActual = 1;

let materiasDocente = [];

let materiaDocenteActual = null;

let seccionesDocente = [];

let seccionDocenteActual = null;

let rutaDocenteActual = [];

let materialesDocenteActual = [];


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPortalDocente
);


async function iniciarPortalDocente() {

    registrarEventosDocente();


    try {

        await protegerPortalDocente();

        await cargarMateriasDocente();

    }
    catch (error) {

        console.error(
            "Error iniciando portal docente:",
            error
        );


        mostrarErrorDocente(
            error.message ||
            "No fue posible cargar el portal docente."
        );

    }

}


// ============================================================
// EVENTOS
// ============================================================

function registrarEventosDocente() {

    document
        .getElementById(
            "btnCerrarSesionDocente"
        )
        ?.addEventListener(
            "click",
            cerrarSesionDocente
        );


    document
        .getElementById(
            "btnVolverMateriasDocente"
        )
        ?.addEventListener(
            "click",
            volverMateriasDocente
        );


    document
        .querySelectorAll(
            ".btn-semestre-docente"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        cambiarSemestreDocente(
                            Number(
                                boton.dataset.semestre
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-docente-btn"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        cambiarVistaDocente(
                            boton.dataset.vista
                        );

                    }
                );

            }
        );


    document
        .getElementById(
            "formObservacionDocente"
        )
        ?.addEventListener(
            "submit",
            enviarObservacionDocente
        );


    document
        .getElementById(
            "textoObservacionDocente"
        )
        ?.addEventListener(
            "input",
            actualizarContadorObservacion
        );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                cerrarVideoDocente();

            }

        }
    );

}


// ============================================================
// PROTEGER PÁGINA
// ============================================================

async function protegerPortalDocente() {

    const {
        data: sesionData,
        error: sesionError
    } =
        await supabaseClient.auth
            .getSession();


    if (sesionError) {
        throw sesionError;
    }


    const usuario =
        sesionData?.session?.user;


    if (!usuario) {

        throw new Error(
            "No existe una sesión activa."
        );

    }


    const {
        data: perfil,
        error: perfilError
    } =
        await supabaseClient
            .from("perfiles")
            .select(
                "id, usuario, nombre, rol, activo"
            )
            .eq(
                "id",
                usuario.id
            )
            .single();


    if (perfilError) {
        throw perfilError;
    }


    if (
        !perfil
        ||
        perfil.activo !== true
        ||
        perfil.rol !== "docente"
    ) {

        await supabaseClient.auth
            .signOut();


        throw new Error(
            "Esta cuenta no tiene acceso al portal docente."
        );

    }


    perfilDocente =
        perfil;


    document.getElementById(
        "saludoDocente"
    ).textContent =
        `Hola, ${perfil.nombre}`;


    document.getElementById(
        "nombreDocente"
    ).textContent =
        perfil.nombre;


    document.getElementById(
        "pantallaCargaDocente"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "portalDocente"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// CAMBIAR VISTA
// ============================================================

function cambiarVistaDocente(
    vista
) {

    document
        .querySelectorAll(
            ".nav-docente-btn"
        )
        .forEach(
            boton => {

                boton.classList.toggle(
                    "activo",
                    boton.dataset.vista ===
                    vista
                );

            }
        );


    document.getElementById(
        "vistaMaterialDocente"
    ).classList.toggle(
        "oculto",
        vista !== "material"
    );


    document.getElementById(
        "vistaObservacionesDocente"
    ).classList.toggle(
        "oculto",
        vista !== "observaciones"
    );

}


// ============================================================
// CARGAR MATERIAS
// ============================================================

async function cargarMateriasDocente() {

    const contenedor =
        document.getElementById(
            "listaMateriasDocente"
        );


    contenedor.innerHTML = `

        <p class="estado-carga">
            Cargando materias...
        </p>

    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "materias_estudiantes"
            )
            .select(
                "id, nombre, semestre, descripcion, orden"
            )
            .eq(
                "activo",
                true
            )
            .eq(
                "semestre",
                semestreDocenteActual
            )
            .order(
                "orden",
                {
                    ascending: true
                }
            )
            .order(
                "nombre",
                {
                    ascending: true
                }
            );


    if (error) {
        throw error;
    }


    materiasDocente =
        data || [];


    renderizarMateriasDocente();

}


// ============================================================
// RENDERIZAR MATERIAS
// ============================================================

function renderizarMateriasDocente() {

    const contenedor =
        document.getElementById(
            "listaMateriasDocente"
        );


    document.getElementById(
        "tituloMateriasDocente"
    ).textContent =
        `${semestreDocenteActual}° semestre`;


    if (!materiasDocente.length) {

        contenedor.innerHTML = `

            <div class="vacio-estudiante">

                <span>📚</span>

                <strong>
                    Sin materias publicadas
                </strong>

                <p>
                    Actualmente no existen materias
                    activas en este semestre.
                </p>

            </div>

        `;


        return;

    }


    contenedor.innerHTML =
        materiasDocente
            .map(
                materia => `

                    <button
                        type="button"
                        class="materia-estudiante-card"
                        onclick="abrirMateriaDocente(${materia.id})"
                    >

                        <span class="icono-materia-estudiante">
                            📘
                        </span>


                        <span class="info-materia-estudiante">

                            <strong>
                                ${escaparTextoDocente(
                                    materia.nombre
                                )}
                            </strong>

                            <small>
                                ${materia.semestre}° semestre
                            </small>

                            ${
                                materia.descripcion
                                    ? `
                                        <span>
                                            ${escaparTextoDocente(
                                                materia.descripcion
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                        </span>


                        <span class="flecha-materia-estudiante">
                            →
                        </span>

                    </button>

                `
            )
            .join("");

}


// ============================================================
// CAMBIAR SEMESTRE
// ============================================================

async function cambiarSemestreDocente(
    semestre
) {

    semestreDocenteActual =
        semestre;


    document
        .querySelectorAll(
            ".btn-semestre-docente"
        )
        .forEach(
            boton => {

                boton.classList.toggle(
                    "activo",
                    Number(
                        boton.dataset.semestre
                    ) === semestre
                );

            }
        );


    volverMateriasDocente();


    await cargarMateriasDocente();

}


// ============================================================
// ABRIR MATERIA
// ============================================================

async function abrirMateriaDocente(
    materiaId
) {

    const materia =
        materiasDocente.find(
            item =>
                Number(item.id) ===
                Number(materiaId)
        );


    if (!materia) {
        return;
    }


    materiaDocenteActual =
        materia;


    seccionDocenteActual =
        null;


    rutaDocenteActual =
        [];


    document.getElementById(
        "panelMateriasDocente"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "panelMateriaDocente"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "nombreMateriaDocente"
    ).textContent =
        materia.nombre;


    document.getElementById(
        "semestreMateriaDocente"
    ).textContent =
        `${materia.semestre}° SEMESTRE`;


    document.getElementById(
        "contenidoDocente"
    ).innerHTML = `

        <p class="estado-carga">
            Cargando contenido...
        </p>

    `;


    await cargarSeccionesDocente();


    actualizarRutaDocente();


    await cargarContenidoDocente();

}


// ============================================================
// CARGAR SECCIONES
// ============================================================

async function cargarSeccionesDocente() {

    if (!materiaDocenteActual) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "secciones_material"
            )
            .select(
                "id, materia_id, seccion_padre_id, nombre, orden"
            )
            .eq(
                "materia_id",
                materiaDocenteActual.id
            )
            .eq(
                "activo",
                true
            )
            .order(
                "orden",
                {
                    ascending: true
                }
            )
            .order(
                "nombre",
                {
                    ascending: true
                }
            );


    if (error) {
        throw error;
    }


    seccionesDocente =
        data || [];

}


// ============================================================
// CARGAR CONTENIDO
// ============================================================

async function cargarContenidoDocente() {

    const contenedor =
        document.getElementById(
            "contenidoDocente"
        );


    const carpetas =
        seccionesDocente.filter(
            seccion => {

                if (
                    seccionDocenteActual
                ) {

                    return (
                        Number(
                            seccion.seccion_padre_id
                        ) ===
                        Number(
                            seccionDocenteActual.id
                        )
                    );

                }


                return (
                    seccion.seccion_padre_id === null
                );

            }
        );


    let materiales = [];


    if (
        seccionDocenteActual
    ) {

        contenedor.innerHTML = `

            <p class="estado-carga">
                Cargando contenido...
            </p>

        `;


        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "material_estudiantes"
                )
                .select(
                    "id, seccion_id, titulo, descripcion, tipo, url, orden"
                )
                .eq(
                    "seccion_id",
                    seccionDocenteActual.id
                )
                .eq(
                    "activo",
                    true
                )
                .order(
                    "orden",
                    {
                        ascending: true
                    }
                )
                .order(
                    "titulo",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        materiales =
            data || [];

    }


    materialesDocenteActual =
        materiales;


    renderizarContenidoDocente(
        carpetas,
        materiales
    );

}


// ============================================================
// RENDERIZAR CONTENIDO
// ============================================================

function renderizarContenidoDocente(
    carpetas,
    materiales
) {

    const contenedor =
        document.getElementById(
            "contenidoDocente"
        );


    let html = "";


    // ========================================================
    // CARPETAS
    // ========================================================

    if (carpetas.length) {

        html += `

            <div class="subtitulo-estudiante">
                Carpetas
            </div>


            <div class="grid-carpetas-estudiante">

        `;


        html += carpetas
            .map(
                carpeta => `

                    <button
                        type="button"
                        class="carpeta-estudiante-card"
                        onclick="abrirCarpetaDocente(${carpeta.id})"
                    >

                        <span>📁</span>


                        <div>

                            <strong>
                                ${escaparTextoDocente(
                                    carpeta.nombre
                                )}
                            </strong>

                            <small>
                                Abrir carpeta
                            </small>

                        </div>


                        <b>→</b>

                    </button>

                `
            )
            .join("");


        html += `
            </div>
        `;

    }


    // ========================================================
    // MATERIALES
    // ========================================================

    if (materiales.length) {

        html += `

            <div class="subtitulo-estudiante">
                Material
            </div>


            <div class="lista-recursos-estudiante">

        `;


        html += materiales
            .map(
                material =>
                    crearHTMLMaterialDocente(
                        material
                    )
            )
            .join("");


        html += `
            </div>
        `;

    }


    // ========================================================
    // VACÍO
    // ========================================================

    if (
        !carpetas.length
        &&
        !materiales.length
    ) {

        html = `

            <div class="vacio-estudiante">

                <span>📂</span>

                <strong>
                    Carpeta vacía
                </strong>

                <p>
                    No existe material publicado
                    en esta ubicación.
                </p>

            </div>

        `;

    }


    contenedor.innerHTML =
        html;

}


// ============================================================
// CREAR MATERIAL
// ============================================================

function crearHTMLMaterialDocente(
    material
) {

    const tipo =
        String(
            material.tipo || ""
        ).toLowerCase();


    const icono =
        tipo === "drive"
            ? "📄"
            : tipo === "video"
                ? "▶️"
                : "🔗";


    const nombreTipo =
        tipo === "drive"
            ? "Documento"
            : tipo === "video"
                ? "Video"
                : "Enlace";


    let accion;


    if (tipo === "video") {

        accion = `

            <button
                type="button"
                class="btn-abrir-recurso-estudiante"
                onclick="reproducirVideoDocente(
                    '${escaparJSInlineDocente(material.url)}',
                    '${escaparJSInlineDocente(material.titulo)}'
                )"
            >
                ▶ Reproducir
            </button>

        `;

    }
    else {

        accion = `

            <a
                href="${escaparTextoDocente(material.url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-abrir-recurso-estudiante"
            >
                Abrir
            </a>

        `;

    }


    return `

        <article class="recurso-estudiante-card">

            <div class="icono-recurso-estudiante">
                ${icono}
            </div>


            <div class="info-recurso-estudiante">

                <strong>
                    ${escaparTextoDocente(
                        material.titulo
                    )}
                </strong>

                <small>
                    ${nombreTipo}
                </small>

                ${
                    material.descripcion
                        ? `
                            <p>
                                ${escaparTextoDocente(
                                    material.descripcion
                                )}
                            </p>
                        `
                        : ""
                }

            </div>


            <div class="accion-recurso-estudiante">
                ${accion}
            </div>

        </article>

    `;

}


// ============================================================
// ABRIR CARPETA
// ============================================================

async function abrirCarpetaDocente(
    id
) {

    const seccion =
        seccionesDocente.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!seccion) {
        return;
    }


    seccionDocenteActual =
        seccion;


    construirRutaDocente(
        seccion
    );


    actualizarRutaDocente();


    await cargarContenidoDocente();

}


// ============================================================
// CONSTRUIR RUTA
// ============================================================

function construirRutaDocente(
    seccion
) {

    const ruta = [];

    const visitados =
        new Set();


    let actual =
        seccion;


    while (actual) {

        if (
            visitados.has(actual.id)
        ) {

            console.error(
                "Ciclo detectado en secciones."
            );

            break;

        }


        visitados.add(
            actual.id
        );


        ruta.unshift(
            actual
        );


        if (
            actual.seccion_padre_id === null
        ) {

            break;

        }


        actual =
            seccionesDocente.find(
                item =>
                    Number(item.id) ===
                    Number(
                        actual.seccion_padre_id
                    )
            );

    }


    rutaDocenteActual =
        ruta;

}


// ============================================================
// ACTUALIZAR RUTA
// ============================================================

function actualizarRutaDocente() {

    const contenedor =
        document.getElementById(
            "rutaDocente"
        );


    if (!materiaDocenteActual) {

        contenedor.innerHTML = "";

        return;

    }


    let html = `

        <button
            type="button"
            onclick="irRaizDocente()"
        >
            ${escaparTextoDocente(
                materiaDocenteActual.nombre
            )}
        </button>

    `;


    rutaDocenteActual.forEach(
        seccion => {

            html += `

                <span>›</span>

                <button
                    type="button"
                    onclick="irSeccionRutaDocente(${seccion.id})"
                >
                    ${escaparTextoDocente(
                        seccion.nombre
                    )}
                </button>

            `;

        }
    );


    contenedor.innerHTML =
        html;

}


// ============================================================
// IR A RAÍZ
// ============================================================

async function irRaizDocente() {

    seccionDocenteActual =
        null;


    rutaDocenteActual =
        [];


    actualizarRutaDocente();


    await cargarContenidoDocente();

}


// ============================================================
// IR A UNA CARPETA DE LA RUTA
// ============================================================

async function irSeccionRutaDocente(
    id
) {

    const seccion =
        seccionesDocente.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!seccion) {
        return;
    }


    seccionDocenteActual =
        seccion;


    construirRutaDocente(
        seccion
    );


    actualizarRutaDocente();


    await cargarContenidoDocente();

}


// ============================================================
// VOLVER A MATERIAS
// ============================================================

function volverMateriasDocente() {

    materiaDocenteActual =
        null;


    seccionDocenteActual =
        null;


    rutaDocenteActual =
        [];


    document.getElementById(
        "panelMateriaDocente"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "panelMateriasDocente"
    )?.classList.remove(
        "oculto"
    );

}


// ============================================================
// OBSERVACIÓN
// ============================================================

async function enviarObservacionDocente(
    event
) {

    event.preventDefault();


    const tipo =
        document.getElementById(
            "tipoObservacionDocente"
        ).value;


    const observacion =
        document.getElementById(
            "textoObservacionDocente"
        ).value.trim();


    const boton =
        document.getElementById(
            "btnEnviarObservacionDocente"
        );


    if (!observacion) {

        mostrarMensajeDocente(
            "Escribe una observación.",
            "error"
        );

        return;

    }


    if (
        observacion.length > 1500
    ) {

        mostrarMensajeDocente(
            "La observación no puede superar los 1500 caracteres.",
            "error"
        );

        return;

    }


    boton.disabled = true;

    boton.textContent =
        "ENVIANDO...";


    try {

        const {
            error
        } =
            await supabaseClient.rpc(
                "crear_observacion_docente_material",
                {
                    p_tipo:
                        tipo,

                    p_observacion:
                        observacion
                }
            );


        if (error) {
            throw error;
        }


        document.getElementById(
            "formObservacionDocente"
        ).reset();


        actualizarContadorObservacion();


        mostrarMensajeDocente(
            "Observación enviada correctamente.",
            "exito"
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeDocente(
            error.message ||
            "No fue posible enviar la observación.",
            "error"
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "ENVIAR OBSERVACIÓN";

    }

}


// ============================================================
// CONTADOR
// ============================================================

function actualizarContadorObservacion() {

    const textarea =
        document.getElementById(
            "textoObservacionDocente"
        );


    const contador =
        document.getElementById(
            "contadorObservacionDocente"
        );


    if (
        !textarea
        ||
        !contador
    ) {

        return;

    }


    contador.textContent =
        textarea.value.length;

}


// ============================================================
// MENSAJE OBSERVACIÓN
// ============================================================

function mostrarMensajeDocente(
    texto,
    tipo = ""
) {

    const elemento =
        document.getElementById(
            "mensajeObservacionDocente"
        );


    elemento.textContent =
        texto;


    elemento.className =
        "mensaje";


    if (tipo) {

        elemento.classList.add(
            tipo
        );

    }

}


// ============================================================
// VIDEO
// ============================================================

function reproducirVideoDocente(
    url,
    titulo
) {

    const embed =
        convertirVideoDocente(
            url
        );


    if (!embed) {

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

        return;

    }


    document.getElementById(
        "tituloVideoDocente"
    ).textContent =
        titulo || "Video";


    document.getElementById(
        "visorVideoDocente"
    ).innerHTML = `

        <iframe
            src="${escaparTextoDocente(embed)}"
            title="${escaparTextoDocente(titulo || "Video")}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
        ></iframe>

    `;


    document.getElementById(
        "modalVideoDocente"
    ).classList.remove(
        "oculto"
    );


    document.body.classList.add(
        "sin-scroll"
    );

}


// ============================================================
// CONVERTIR VIDEO
// ============================================================

function convertirVideoDocente(
    url
) {

    try {

        const direccion =
            new URL(url);


        const host =
            direccion.hostname
                .toLowerCase()
                .replace(
                    /^www\./,
                    ""
                );


        // YOUTUBE

        if (
            host === "youtube.com"
            ||
            host === "m.youtube.com"
        ) {

            if (
                direccion.pathname ===
                "/watch"
            ) {

                const id =
                    direccion.searchParams
                        .get("v");


                if (id) {

                    return (
                        "https://www.youtube.com/embed/"
                        +
                        encodeURIComponent(id)
                    );

                }

            }


            if (
                direccion.pathname
                    .startsWith("/shorts/")
            ) {

                const id =
                    direccion.pathname
                        .split("/")[2];


                if (id) {

                    return (
                        "https://www.youtube.com/embed/"
                        +
                        encodeURIComponent(id)
                    );

                }

            }


            if (
                direccion.pathname
                    .startsWith("/embed/")
            ) {

                return url;

            }

        }


        if (
            host === "youtu.be"
        ) {

            const id =
                direccion.pathname
                    .replace("/", "");


            if (id) {

                return (
                    "https://www.youtube.com/embed/"
                    +
                    encodeURIComponent(id)
                );

            }

        }


        // VIMEO

        if (
            host === "vimeo.com"
        ) {

            const partes =
                direccion.pathname
                    .split("/")
                    .filter(Boolean);


            const id =
                partes[0];


            if (
                id
                &&
                /^\d+$/.test(id)
            ) {

                return (
                    "https://player.vimeo.com/video/"
                    +
                    id
                );

            }

        }


        if (
            host === "player.vimeo.com"
            &&
            direccion.pathname
                .startsWith("/video/")
        ) {

            return url;

        }


        // GOOGLE DRIVE

        if (
            host === "drive.google.com"
        ) {

            const coincidencia =
                direccion.pathname.match(
                    /\/file\/d\/([^/]+)/
                );


            if (
                coincidencia?.[1]
            ) {

                return (
                    "https://drive.google.com/file/d/"
                    +
                    encodeURIComponent(
                        coincidencia[1]
                    )
                    +
                    "/preview"
                );

            }

        }


        return null;

    }
    catch {

        return null;

    }

}


// ============================================================
// CERRAR VIDEO
// ============================================================

function cerrarVideoDocente() {

    const modal =
        document.getElementById(
            "modalVideoDocente"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "oculto"
    );


    document.getElementById(
        "visorVideoDocente"
    ).innerHTML = "";


    document.body.classList.remove(
        "sin-scroll"
    );

}


// ============================================================
// CERRAR SESIÓN
// ============================================================

async function cerrarSesionDocente() {

    const boton =
        document.getElementById(
            "btnCerrarSesionDocente"
        );


    boton.disabled = true;


    try {

        await supabaseClient.auth
            .signOut();

    }
    catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }
    finally {

        window.location.replace(
            "index.html"
        );

    }

}


// ============================================================
// ERROR
// ============================================================

function mostrarErrorDocente(
    mensaje
) {

    document.getElementById(
        "pantallaCargaDocente"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "portalDocente"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "textoErrorDocente"
    ).textContent =
        mensaje;


    document.getElementById(
        "errorDocente"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparTextoDocente(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// ESCAPAR TEXTO PARA ONCLICK
// ============================================================

function escaparJSInlineDocente(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /\r/g,
            ""
        )
        .replace(
            /\n/g,
            "\\n"
        );

}

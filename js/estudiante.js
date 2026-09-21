// ============================================================
// CETA - MATERIAL PARA ESTUDIANTES
// PORTAL DEL ESTUDIANTE
// ============================================================


const TOKEN_ESTUDIANTE =
    "ceta_estudiante_token";


let tokenEstudiante = null;

let datosEstudiante = null;

let materiasEstudiante = [];

let materiaEstudianteActual = null;

let seccionesEstudiante = [];

let seccionEstudianteActual = null;

let rutaEstudianteActual = [];

let semestreVisualizado = null;


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPortalEstudiante
);


async function iniciarPortalEstudiante() {

    registrarEventosEstudiante();


    tokenEstudiante =
        sessionStorage.getItem(
            TOKEN_ESTUDIANTE
        );


    if (!tokenEstudiante) {

        mostrarErrorSesion(
            "No existe una sesión de estudiante activa."
        );

        return;

    }


    try {

        await validarSesionEstudiante();

        await cargarMateriasEstudiante();

    }
    catch (error) {

        console.error(
            "Error iniciando portal:",
            error
        );


        mostrarErrorSesion(
            error.message ||
            "No fue posible validar tu sesión."
        );

    }

}


// ============================================================
// EVENTOS
// ============================================================

function registrarEventosEstudiante() {

    document
        .getElementById(
            "btnCerrarSesionEstudiante"
        )
        ?.addEventListener(
            "click",
            cerrarSesionEstudiante
        );


    document
        .getElementById(
            "btnVolverMateriasEstudiante"
        )
        ?.addEventListener(
            "click",
            volverMateriasEstudiante
        );


    document
        .querySelectorAll(
            ".btn-semestre-estudiante"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        cambiarSemestreEgresado(
                            Number(
                                boton.dataset.semestre
                            )
                        );

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                cerrarVideoEstudiante();

            }

        }
    );

}


// ============================================================
// VALIDAR SESIÓN
// ============================================================

async function validarSesionEstudiante() {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "validar_sesion_estudiante",
            {
                p_token:
                    tokenEstudiante
            }
        );


    if (error) {
        throw error;
    }


    const datos =
        Array.isArray(data)
            ? data[0]
            : data;


    if (!datos) {

        throw new Error(
            "Tu sesión ha expirado. Ingresa nuevamente."
        );

    }


    datosEstudiante =
        datos;


    configurarCabeceraEstudiante();


    document.getElementById(
        "pantallaCargaEstudiante"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "portalEstudiante"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// DATOS DEL ESTUDIANTE
// ============================================================

function configurarCabeceraEstudiante() {

    document.getElementById(
        "saludoEstudiante"
    ).textContent =
        `Hola, ${datosEstudiante.nombre}`;


    document.getElementById(
        "nombreEstudiante"
    ).textContent =
        datosEstudiante.nombre;


    const esEgresado =
        datosEstudiante.estado ===
        "egresado"
        ||
        datosEstudiante.acceso_completo === true;


    if (esEgresado) {

        document.getElementById(
            "grupoEstudiante"
        ).textContent =
            "Egresado";


        document.getElementById(
            "accesoEstudiante"
        ).textContent =
            "1° a 6° semestre";


        document.getElementById(
            "selectorSemestreEstudiante"
        ).classList.remove(
            "oculto"
        );


        semestreVisualizado = 1;

    }
    else {

        document.getElementById(
            "grupoEstudiante"
        ).textContent =
            datosEstudiante.grupo || "-";


        document.getElementById(
            "accesoEstudiante"
        ).textContent =
            `${datosEstudiante.semestre}° semestre`;


        document.getElementById(
            "selectorSemestreEstudiante"
        ).classList.add(
            "oculto"
        );


        semestreVisualizado =
            Number(
                datosEstudiante.semestre
            );

    }

}


// ============================================================
// CARGAR MATERIAS
// ============================================================

async function cargarMateriasEstudiante() {

    const contenedor =
        document.getElementById(
            "listaMateriasEstudiante"
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
        await supabaseClient.rpc(
            "obtener_materias_estudiante",
            {
                p_token:
                    tokenEstudiante
            }
        );


    if (error) {

        if (
            esErrorSesion(
                error
            )
        ) {

            mostrarErrorSesion(
                "Tu sesión ha expirado. Ingresa nuevamente."
            );

            return;

        }


        throw error;

    }


    materiasEstudiante =
        data || [];


    renderizarMateriasEstudiante();

}


// ============================================================
// MOSTRAR MATERIAS
// ============================================================

function renderizarMateriasEstudiante() {

    const contenedor =
        document.getElementById(
            "listaMateriasEstudiante"
        );


    const materias =
        materiasEstudiante.filter(
            materia =>
                Number(
                    materia.semestre
                ) ===
                Number(
                    semestreVisualizado
                )
        );


    document.getElementById(
        "tituloMateriasEstudiante"
    ).textContent =
        `${semestreVisualizado}° semestre`;


    if (!materias.length) {

        contenedor.innerHTML = `

            <div class="vacio-estudiante">

                <span>
                    📚
                </span>

                <strong>
                    No hay material disponible
                </strong>

                <p>
                    Actualmente no existen materias
                    publicadas para este semestre.
                </p>

            </div>

        `;


        return;

    }


    contenedor.innerHTML =
        materias
            .map(
                materia => `

                    <button
                        type="button"
                        class="materia-estudiante-card"
                        onclick="abrirMateriaEstudiante(${materia.id})"
                    >

                        <span class="icono-materia-estudiante">
                            📘
                        </span>


                        <span class="info-materia-estudiante">

                            <strong>
                                ${escaparTextoEstudiante(
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
                                            ${escaparTextoEstudiante(
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
// CAMBIAR SEMESTRE - EGRESADO
// ============================================================

function cambiarSemestreEgresado(
    semestre
) {

    if (
        !datosEstudiante
        ||
        !datosEstudiante.acceso_completo
    ) {

        return;

    }


    semestreVisualizado =
        semestre;


    document
        .querySelectorAll(
            ".btn-semestre-estudiante"
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


    volverMateriasEstudiante();


    renderizarMateriasEstudiante();

}


// ============================================================
// ABRIR MATERIA
// ============================================================

async function abrirMateriaEstudiante(
    materiaId
) {

    const materia =
        materiasEstudiante.find(
            item =>
                Number(item.id) ===
                Number(materiaId)
        );


    if (!materia) {
        return;
    }


    materiaEstudianteActual =
        materia;


    seccionEstudianteActual =
        null;


    rutaEstudianteActual =
        [];


    document.getElementById(
        "panelMateriasEstudiante"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "selectorSemestreEstudiante"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "panelMateriaEstudiante"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "nombreMateriaEstudiante"
    ).textContent =
        materia.nombre;


    document.getElementById(
        "semestreMateriaEstudiante"
    ).textContent =
        `${materia.semestre}° SEMESTRE`;


    document.getElementById(
        "contenidoEstudiante"
    ).innerHTML = `

        <p class="estado-carga">
            Cargando contenido...
        </p>

    `;


    await cargarSeccionesEstudiante();


    actualizarRutaEstudiante();


    await cargarContenidoEstudiante();

}


// ============================================================
// CARGAR SECCIONES
// ============================================================

async function cargarSeccionesEstudiante() {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "obtener_secciones_estudiante",
            {
                p_token:
                    tokenEstudiante,

                p_materia_id:
                    materiaEstudianteActual.id
            }
        );


    if (error) {

        if (
            esErrorSesion(error)
        ) {

            mostrarErrorSesion(
                "Tu sesión ha expirado. Ingresa nuevamente."
            );

            return;

        }


        throw error;

    }


    seccionesEstudiante =
        data || [];

}


// ============================================================
// CONTENIDO DE LA UBICACIÓN ACTUAL
// ============================================================

async function cargarContenidoEstudiante() {

    const contenedor =
        document.getElementById(
            "contenidoEstudiante"
        );


    const carpetas =
        seccionesEstudiante.filter(
            seccion => {

                if (
                    seccionEstudianteActual
                ) {

                    return (
                        Number(
                            seccion.seccion_padre_id
                        ) ===
                        Number(
                            seccionEstudianteActual.id
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
        seccionEstudianteActual
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
            await supabaseClient.rpc(
                "obtener_material_estudiante",
                {
                    p_token:
                        tokenEstudiante,

                    p_seccion_id:
                        seccionEstudianteActual.id
                }
            );


        if (error) {

            if (
                esErrorSesion(error)
            ) {

                mostrarErrorSesion(
                    "Tu sesión ha expirado. Ingresa nuevamente."
                );

                return;

            }


            throw error;

        }


        materiales =
            data || [];

    }


    renderizarContenidoEstudiante(
        carpetas,
        materiales
    );

}


// ============================================================
// RENDERIZAR CARPETAS Y MATERIAL
// ============================================================

function renderizarContenidoEstudiante(
    carpetas,
    materiales
) {

    const contenedor =
        document.getElementById(
            "contenidoEstudiante"
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
                        onclick="abrirCarpetaEstudiante(${carpeta.id})"
                    >

                        <span>
                            📁
                        </span>


                        <div>

                            <strong>
                                ${escaparTextoEstudiante(
                                    carpeta.nombre
                                )}
                            </strong>

                            <small>
                                Abrir carpeta
                            </small>

                        </div>


                        <b>
                            →
                        </b>

                    </button>

                `
            )
            .join("");


        html += `
            </div>
        `;

    }


    // ========================================================
    // MATERIAL
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
                    crearHTMLMaterialEstudiante(
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

                <span>
                    📂
                </span>

                <strong>
                    Carpeta vacía
                </strong>

                <p>
                    Todavía no existe material
                    publicado en esta ubicación.
                </p>

            </div>

        `;

    }


    contenedor.innerHTML =
        html;

}


// ============================================================
// HTML DE UN MATERIAL
// ============================================================

function crearHTMLMaterialEstudiante(
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


    let accion = "";


    if (
        tipo === "video"
    ) {

        accion = `

            <button
                type="button"
                class="btn-abrir-recurso-estudiante"
                onclick="reproducirVideoEstudiante(
                    '${escaparAtributoJS(material.url)}',
                    '${escaparAtributoJS(material.titulo)}'
                )"
            >
                ▶ Reproducir
            </button>

        `;

    }
    else {

        accion = `

            <a
                href="${escaparAtributoHTML(material.url)}"
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
                    ${escaparTextoEstudiante(
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
                                ${escaparTextoEstudiante(
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

async function abrirCarpetaEstudiante(
    seccionId
) {

    const seccion =
        seccionesEstudiante.find(
            item =>
                Number(item.id) ===
                Number(seccionId)
        );


    if (!seccion) {
        return;
    }


    seccionEstudianteActual =
        seccion;


    construirRutaEstudiante(
        seccion
    );


    actualizarRutaEstudiante();


    await cargarContenidoEstudiante();

}


// ============================================================
// CONSTRUIR RUTA
// ============================================================

function construirRutaEstudiante(
    seccion
) {

    const ruta = [];

    const visitados =
        new Set();


    let actual =
        seccion;


    while (actual) {

        if (
            visitados.has(
                actual.id
            )
        ) {

            console.error(
                "Ciclo detectado en estructura de material."
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
            seccionesEstudiante.find(
                item =>
                    Number(item.id) ===
                    Number(
                        actual.seccion_padre_id
                    )
            );

    }


    rutaEstudianteActual =
        ruta;

}


// ============================================================
// MOSTRAR RUTA
// ============================================================

function actualizarRutaEstudiante() {

    const contenedor =
        document.getElementById(
            "rutaEstudiante"
        );


    if (
        !materiaEstudianteActual
    ) {

        contenedor.innerHTML = "";

        return;

    }


    let html = `

        <button
            type="button"
            onclick="irRaizMateriaEstudiante()"
        >
            ${escaparTextoEstudiante(
                materiaEstudianteActual.nombre
            )}
        </button>

    `;


    rutaEstudianteActual
        .forEach(
            seccion => {

                html += `

                    <span>
                        ›
                    </span>

                    <button
                        type="button"
                        onclick="irSeccionRutaEstudiante(${seccion.id})"
                    >
                        ${escaparTextoEstudiante(
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

async function irRaizMateriaEstudiante() {

    seccionEstudianteActual =
        null;


    rutaEstudianteActual =
        [];


    actualizarRutaEstudiante();


    await cargarContenidoEstudiante();

}


// ============================================================
// IR A CARPETA DESDE RUTA
// ============================================================

async function irSeccionRutaEstudiante(
    id
) {

    const seccion =
        seccionesEstudiante.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!seccion) {
        return;
    }


    seccionEstudianteActual =
        seccion;


    construirRutaEstudiante(
        seccion
    );


    actualizarRutaEstudiante();


    await cargarContenidoEstudiante();

}


// ============================================================
// VOLVER A MATERIAS
// ============================================================

function volverMateriasEstudiante() {

    materiaEstudianteActual =
        null;


    seccionEstudianteActual =
        null;


    rutaEstudianteActual =
        [];


    document.getElementById(
        "panelMateriaEstudiante"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "panelMateriasEstudiante"
    ).classList.remove(
        "oculto"
    );


    if (
        datosEstudiante?.acceso_completo
    ) {

        document.getElementById(
            "selectorSemestreEstudiante"
        ).classList.remove(
            "oculto"
        );

    }

}


// ============================================================
// VIDEO
// ============================================================

function reproducirVideoEstudiante(
    url,
    titulo
) {

    const embed =
        convertirUrlVideoEmbed(
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
        "tituloVideoEstudiante"
    ).textContent =
        titulo || "Video";


    document.getElementById(
        "visorVideoEstudiante"
    ).innerHTML = `

        <iframe
            src="${escaparAtributoHTML(embed)}"
            title="${escaparAtributoHTML(titulo || "Video")}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
        ></iframe>

    `;


    document.getElementById(
        "modalVideoEstudiante"
    ).classList.remove(
        "oculto"
    );


    document.body.classList.add(
        "sin-scroll"
    );

}


// ============================================================
// CONVERTIR URL A EMBED
// ============================================================

function convertirUrlVideoEmbed(
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


        // ====================================================
        // YOUTUBE
        // ====================================================

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
                    direccion.searchParams.get(
                        "v"
                    );


                if (id) {

                    return (
                        "https://www.youtube.com/embed/"
                        +
                        encodeURIComponent(id)
                    );

                }

            }


            if (
                direccion.pathname.startsWith(
                    "/shorts/"
                )
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
                direccion.pathname.startsWith(
                    "/embed/"
                )
            ) {

                return url;

            }

        }


        if (
            host === "youtu.be"
        ) {

            const id =
                direccion.pathname
                    .replace(
                        "/",
                        ""
                    );


            if (id) {

                return (
                    "https://www.youtube.com/embed/"
                    +
                    encodeURIComponent(id)
                );

            }

        }


        // ====================================================
        // VIMEO
        // ====================================================

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
            direccion.pathname.startsWith(
                "/video/"
            )
        ) {

            return url;

        }


        // ====================================================
        // GOOGLE DRIVE
        // ====================================================

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

function cerrarVideoEstudiante() {

    const modal =
        document.getElementById(
            "modalVideoEstudiante"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "oculto"
    );


    document.getElementById(
        "visorVideoEstudiante"
    ).innerHTML = "";


    document.body.classList.remove(
        "sin-scroll"
    );

}


// ============================================================
// CERRAR SESIÓN
// ============================================================

async function cerrarSesionEstudiante() {

    const boton =
        document.getElementById(
            "btnCerrarSesionEstudiante"
        );


    boton.disabled = true;


    try {

        if (
            tokenEstudiante
        ) {

            await supabaseClient.rpc(
                "cerrar_sesion_estudiante",
                {
                    p_token:
                        tokenEstudiante
                }
            );

        }

    }
    catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }
    finally {

        sessionStorage.removeItem(
            TOKEN_ESTUDIANTE
        );


        tokenEstudiante =
            null;


        window.location.replace(
            "index.html"
        );

    }

}


// ============================================================
// ERROR DE SESIÓN
// ============================================================

function mostrarErrorSesion(
    mensaje
) {

    sessionStorage.removeItem(
        TOKEN_ESTUDIANTE
    );


    document.getElementById(
        "pantallaCargaEstudiante"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "portalEstudiante"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "textoErrorSesionEstudiante"
    ).textContent =
        mensaje;


    document.getElementById(
        "errorSesionEstudiante"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// DETECTAR ERROR DE SESIÓN
// ============================================================

function esErrorSesion(
    error
) {

    const mensaje =
        String(
            error?.message || ""
        ).toLowerCase();


    return (
        mensaje.includes(
            "sesión"
        )
        ||
        mensaje.includes(
            "sesion"
        )
        ||
        mensaje.includes(
            "token"
        )
        ||
        mensaje.includes(
            "expir"
        )
    );

}


// ============================================================
// SEGURIDAD HTML
// ============================================================

function escaparTextoEstudiante(
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
// SEGURIDAD ATRIBUTOS HTML
// ============================================================

function escaparAtributoHTML(
    valor
) {

    return escaparTextoEstudiante(
        valor
    );

}


// ============================================================
// SEGURIDAD PARA onclick
// ============================================================

function escaparAtributoJS(
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

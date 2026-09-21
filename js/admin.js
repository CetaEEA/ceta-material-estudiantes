// ============================================================
// CETA - MATERIAL ACADÉMICO
// PANEL ADMINISTRADOR
// VERSIÓN CORREGIDA SEGÚN ADMIN.HTML REAL
// ============================================================


// ============================================================
// VARIABLES GENERALES
// ============================================================

let perfilAdministrador = null;

let grupos = [];

let estudiantesGrupo = [];

let grupoSeleccionado = null;

let estudiantesExcel = [];

let grupoDestinoPromocion = null;


// ============================================================
// MATERIAL ACADÉMICO
// ============================================================

let semestreMaterialActual = 1;

let materiasMaterial = [];

let materiaAbierta = null;

let seccionesMateria = [];

let seccionActual = null;

let rutaSecciones = [];

let materialesSeccionActual = [];


// ============================================================
// OBSERVACIONES
// ============================================================

let observacionesAdmin = [];

let filtroObservacionesAdmin = "todas";


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPanelAdministrador
);


async function iniciarPanelAdministrador() {

    // Instala el modo claro/oscuro.
    instalarTemaCeta();


    // Registra todos los botones y formularios.
    registrarEventos();


    // Verifica que el usuario sea administrador.
    const autorizado =
        await protegerPanelAdministrador();


    if (!autorizado) {

        return;

    }


    // Carga la información inicial.
    await Promise.all([
        cargarEstadisticas(),
        cargarGrupos(),
        cargarMaterias()
    ]);

}


// ============================================================
// PROTEGER PANEL ADMINISTRADOR
// ============================================================

async function protegerPanelAdministrador() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (
            error
            ||
            !data?.session?.user
        ) {

            window.location.replace(
                "index.html"
            );

            return false;

        }


        const user =
            data.session.user;


        const {
            data: perfil,
            error: errorPerfil
        } =
            await supabaseClient
                .from(
                    "perfiles"
                )
                .select(
                    "id, usuario, nombre, rol, activo"
                )
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (
            errorPerfil
            ||
            !perfil
            ||
            !perfil.activo
            ||
            perfil.rol !== "administrador"
        ) {

            await supabaseClient.auth.signOut();


            window.location.replace(
                "index.html"
            );


            return false;

        }


        perfilAdministrador =
            perfil;


        const nombreAdministrador =
            document.getElementById(
                "nombreAdministrador"
            );


        if (nombreAdministrador) {

            nombreAdministrador.textContent =
                perfil.nombre
                ||
                perfil.usuario
                ||
                "Administrador";

        }


        return true;

    }
    catch (error) {

        console.error(
            "Error verificando administrador:",
            error
        );


        window.location.replace(
            "index.html"
        );


        return false;

    }

}


// ============================================================
// REGISTRAR EVENTOS
// ============================================================

function registrarEventos() {

    // ========================================================
    // CERRAR SESIÓN
    // ========================================================
document
    .getElementById("btnTemaAdmin")
    ?.addEventListener("click", () => {

        const actual =
            document.documentElement.dataset.tema || "claro";

        const nuevo =
            actual === "oscuro"
                ? "claro"
                : "oscuro";

        aplicarTemaAdministrador(nuevo);

        localStorage.setItem(
            "ceta_tema",
            nuevo
        );

    });
    document
        .getElementById(
            "btnCerrarSesion"
        )
        ?.addEventListener(
            "click",
            cerrarSesion
        );


    // ========================================================
    // MENÚ PRINCIPAL
    // ========================================================

    document
        .querySelectorAll(
            ".menu-admin-btn"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        mostrarSeccion(
                            boton.dataset.seccion
                        );

                    }
                );

            }
        );


    // ========================================================
    // BOTONES DEL INICIO
    // ========================================================

    document
        .querySelectorAll(
            "[data-ir]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        mostrarSeccion(
                            boton.dataset.ir
                        );

                    }
                );

            }
        );


    // ========================================================
    // GRUPOS
    // ========================================================

    document
        .getElementById(
            "btnMostrarCrearGrupo"
        )
        ?.addEventListener(
            "click",
            prepararNuevoGrupo
        );


    document
        .getElementById(
            "btnCancelarGrupo"
        )
        ?.addEventListener(
            "click",
            cerrarFormularioGrupo
        );


    document
        .getElementById(
            "formGrupo"
        )
        ?.addEventListener(
            "submit",
            guardarGrupo
        );


    // ========================================================
    // ESTUDIANTES
    // ========================================================

    document
        .getElementById(
            "btnNuevoEstudiante"
        )
        ?.addEventListener(
            "click",
            prepararNuevoEstudiante
        );


    document
        .getElementById(
            "btnCancelarEstudiante"
        )
        ?.addEventListener(
            "click",
            cerrarFormularioEstudiante
        );


    document
        .getElementById(
            "formEstudianteAdmin"
        )
        ?.addEventListener(
            "submit",
            guardarEstudiante
        );


    document
        .getElementById(
            "buscarEstudiante"
        )
        ?.addEventListener(
            "input",
            renderizarEstudiantes
        );


    // ========================================================
    // IMPORTAR EXCEL
    // ========================================================

    document
        .getElementById(
            "btnImportarExcel"
        )
        ?.addEventListener(
            "click",
            abrirImportacionExcel
        );


    document
        .getElementById(
            "archivoExcel"
        )
        ?.addEventListener(
            "change",
            leerArchivoExcel
        );


    document
        .getElementById(
            "btnCancelarExcel"
        )
        ?.addEventListener(
            "click",
            cerrarImportacionExcel
        );


    document
        .getElementById(
            "btnConfirmarExcel"
        )
        ?.addEventListener(
            "click",
            confirmarImportacionExcel
        );


    // ========================================================
    // PROMOCIÓN
    // ========================================================

    document
        .getElementById(
            "btnPromoverGrupo"
        )
        ?.addEventListener(
            "click",
            prepararPromocionGrupo
        );


    document
        .getElementById(
            "btnCancelarPromocion"
        )
        ?.addEventListener(
            "click",
            cerrarPromocion
        );


    document
        .getElementById(
            "btnConfirmarPromocion"
        )
        ?.addEventListener(
            "click",
            confirmarPromocionGrupo
        );


    // ========================================================
    // SEMESTRES DEL MATERIAL
    // ========================================================

    document
        .querySelectorAll(
            ".btn-semestre"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        seleccionarSemestreMaterial(
                            Number(
                                boton.dataset.semestre
                            )
                        );

                    }
                );

            }
        );


    // ========================================================
    // MATERIAS
    // ========================================================

    document
        .getElementById(
            "btnNuevaMateria"
        )
        ?.addEventListener(
            "click",
            prepararNuevaMateria
        );


    document
        .getElementById(
            "btnCancelarMateria"
        )
        ?.addEventListener(
            "click",
            cerrarFormularioMateria
        );


    document
        .getElementById(
            "formMateria"
        )
        ?.addEventListener(
            "submit",
            guardarMateria
        );


    document
        .getElementById(
            "btnVolverMaterias"
        )
        ?.addEventListener(
            "click",
            volverAListaMaterias
        );


    // ========================================================
    // CARPETAS
    // ========================================================

    document
        .getElementById(
            "btnNuevaCarpeta"
        )
        ?.addEventListener(
            "click",
            prepararNuevaCarpeta
        );


    document
        .getElementById(
            "btnCancelarCarpeta"
        )
        ?.addEventListener(
            "click",
            cerrarFormularioCarpeta
        );


    document
        .getElementById(
            "formCarpeta"
        )
        ?.addEventListener(
            "submit",
            guardarCarpeta
        );


    // ========================================================
    // MATERIAL / RECURSOS
    // ========================================================

    document
        .getElementById(
            "btnNuevoMaterial"
        )
        ?.addEventListener(
            "click",
            prepararNuevoMaterialAcademico
        );


    document
        .getElementById(
            "btnCancelarMaterial"
        )
        ?.addEventListener(
            "click",
            cerrarFormularioMaterial
        );


    document
        .getElementById(
            "formMaterialAcademico"
        )
        ?.addEventListener(
            "submit",
            guardarMaterialAcademico
        );


    // ========================================================
    // OBSERVACIONES
    // ========================================================

    document
        .getElementById(
            "btnActualizarObservaciones"
        )
        ?.addEventListener(
            "click",
            cargarObservacionesAdmin
        );


    document
        .querySelectorAll(
            ".filtro-observacion"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        filtroObservacionesAdmin =
                            boton.dataset.filtro;


                        document
                            .querySelectorAll(
                                ".filtro-observacion"
                            )
                            .forEach(
                                item => {

                                    item.classList.toggle(
                                        "activo",
                                        item === boton
                                    );

                                }
                            );


                        renderizarObservacionesAdmin();

                    }
                );

            }
        );

}


// ============================================================
// CERRAR SESIÓN
// ============================================================

async function cerrarSesion() {

    try {

        await supabaseClient.auth.signOut();

    }
    finally {

        window.location.replace(
            "index.html"
        );

    }

}


// ============================================================
// CAMBIAR SECCIÓN DEL ADMINISTRADOR
// ============================================================

function mostrarSeccion(nombre) {

    document
        .querySelectorAll(
            ".seccion-admin"
        )
        .forEach(
            seccion => {

                seccion.classList.remove(
                    "activa"
                );

            }
        );


    document
        .querySelectorAll(
            ".menu-admin-btn"
        )
        .forEach(
            boton => {

                boton.classList.toggle(
                    "activo",
                    boton.dataset.seccion === nombre
                );

            }
        );


    const destino =
        document.getElementById(
            `seccion-${nombre}`
        );


    if (destino) {

        destino.classList.add(
            "activa"
        );

    }


    // Al abrir Observaciones,
    // actualizamos automáticamente los mensajes.

    if (
        nombre ===
        "observaciones"
    ) {

        cargarObservacionesAdmin();

    }

}


// ============================================================
// ESTADÍSTICAS
// ============================================================

async function cargarEstadisticas() {

    try {

        const [
            estudiantes,
            gruposResultado,
            egresados,
            materias
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        "estudiantes_ceta"
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "estado",
                        "estudiante"
                    )
                    .eq(
                        "activo",
                        true
                    ),


                supabaseClient
                    .from(
                        "grupos_estudiantes"
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "activo",
                        true
                    ),


                supabaseClient
                    .from(
                        "estudiantes_ceta"
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "estado",
                        "egresado"
                    )
                    .eq(
                        "activo",
                        true
                    ),


                supabaseClient
                    .from(
                        "materias_estudiantes"
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )

            ]);


        if (estudiantes.error) {

            console.error(
                estudiantes.error
            );

        }


        if (gruposResultado.error) {

            console.error(
                gruposResultado.error
            );

        }


        if (egresados.error) {

            console.error(
                egresados.error
            );

        }


        if (materias.error) {

            console.error(
                materias.error
            );

        }


        const totalEstudiantes =
            document.getElementById(
                "totalEstudiantes"
            );


        const totalGrupos =
            document.getElementById(
                "totalGrupos"
            );


        const totalEgresados =
            document.getElementById(
                "totalEgresados"
            );


        const totalMaterias =
            document.getElementById(
                "totalMaterias"
            );


        if (totalEstudiantes) {

            totalEstudiantes.textContent =
                estudiantes.count ?? 0;

        }


        if (totalGrupos) {

            totalGrupos.textContent =
                gruposResultado.count ?? 0;

        }


        if (totalEgresados) {

            totalEgresados.textContent =
                egresados.count ?? 0;

        }


        if (totalMaterias) {

            totalMaterias.textContent =
                materias.count ?? 0;

        }

    }
    catch (error) {

        console.error(
            "Error cargando estadísticas:",
            error
        );

    }

}


// ============================================================
// CARGAR GRUPOS
// ============================================================

async function cargarGrupos() {

    const contenedor =
        document.getElementById(
            "listaGrupos"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <p class="estado-carga">
            Cargando grupos...
        </p>

    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "grupos_estudiantes"
                )
                .select(
                    "id, codigo_grupo, semestre, activo, created_at"
                )
                .order(
                    "semestre",
                    {
                        ascending: true
                    }
                )
                .order(
                    "codigo_grupo",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;

        }


        grupos =
            data || [];


        renderizarGrupos();

    }
    catch (error) {

        console.error(
            "Error cargando grupos:",
            error
        );


        contenedor.innerHTML = `

            <p class="mensaje error">
                No se pudieron cargar los grupos.
            </p>

        `;

    }

}


// ============================================================
// RENDERIZAR GRUPOS
// ============================================================

function renderizarGrupos() {

    const contenedor =
        document.getElementById(
            "listaGrupos"
        );


    if (!contenedor) {

        return;

    }


    if (!grupos.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <span>
                    👥
                </span>

                <strong>
                    Todavía no existen grupos
                </strong>

                <p>
                    Crea el primer grupo para comenzar.
                </p>

            </div>

        `;


        return;

    }


    contenedor.innerHTML =
        grupos
            .map(
                grupo => {

                    const estado =
                        grupo.activo
                            ? "Activo"
                            : "Inactivo";


                    return `

                        <article
                            class="grupo-card ${
                                grupoSeleccionado?.id === grupo.id
                                    ? "seleccionado"
                                    : ""
                            }"
                        >

                            <button
                                type="button"
                                class="grupo-principal"
                                onclick="seleccionarGrupo(${grupo.id})"
                            >

                                <div>

                                    <strong>

                                        ${escaparHTML(
                                            grupo.codigo_grupo
                                        )}

                                    </strong>


                                    <small>

                                        ${grupo.semestre}° semestre

                                    </small>

                                </div>


                                <span
                                    class="estado-badge ${
                                        grupo.activo
                                            ? "activo"
                                            : "inactivo"
                                    }"
                                >

                                    ${estado}

                                </span>

                            </button>


                            <button
                                type="button"
                                class="btn-icono"
                                title="Editar grupo"
                                onclick="editarGrupo(${grupo.id})"
                            >

                                ✏️

                            </button>

                        </article>

                    `;

                }
            )
            .join("");

}


// ============================================================
// PREPARAR NUEVO GRUPO
// ============================================================

function prepararNuevoGrupo() {

    const form =
        document.getElementById(
            "formGrupo"
        );


    form?.reset();


    const grupoId =
        document.getElementById(
            "grupoId"
        );


    const grupoActivo =
        document.getElementById(
            "grupoActivo"
        );


    const contenedorActivo =
        document.getElementById(
            "contenedorGrupoActivo"
        );


    const titulo =
        document.getElementById(
            "tituloFormularioGrupo"
        );


    const formulario =
        document.getElementById(
            "formularioGrupoContenedor"
        );


    const codigo =
        document.getElementById(
            "codigoGrupo"
        );


    if (grupoId) {

        grupoId.value =
            "";

    }


    if (grupoActivo) {

        grupoActivo.checked =
            true;

    }


    contenedorActivo?.classList.add(
        "oculto"
    );


    if (titulo) {

        titulo.textContent =
            "Crear grupo";

    }


    mostrarMensajeAdmin(
        "mensajeGrupo",
        ""
    );


    formulario?.classList.remove(
        "oculto"
    );


    codigo?.focus();

}


// ============================================================
// EDITAR GRUPO
// ============================================================

function editarGrupo(id) {

    const grupo =
        grupos.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!grupo) {

        return;

    }


    const grupoId =
        document.getElementById(
            "grupoId"
        );


    const codigo =
        document.getElementById(
            "codigoGrupo"
        );


    const semestre =
        document.getElementById(
            "semestreGrupo"
        );


    const activo =
        document.getElementById(
            "grupoActivo"
        );


    const contenedorActivo =
        document.getElementById(
            "contenedorGrupoActivo"
        );


    const titulo =
        document.getElementById(
            "tituloFormularioGrupo"
        );


    const formulario =
        document.getElementById(
            "formularioGrupoContenedor"
        );


    if (grupoId) {

        grupoId.value =
            grupo.id;

    }


    if (codigo) {

        codigo.value =
            grupo.codigo_grupo || "";

    }


    if (semestre) {

        semestre.value =
            String(
                grupo.semestre
            );

    }


    if (activo) {

        activo.checked =
            Boolean(
                grupo.activo
            );

    }


    contenedorActivo?.classList.remove(
        "oculto"
    );


    if (titulo) {

        titulo.textContent =
            "Editar grupo";

    }


    mostrarMensajeAdmin(
        "mensajeGrupo",
        ""
    );


    formulario?.classList.remove(
        "oculto"
    );


    formulario?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// GUARDAR GRUPO
// ============================================================

async function guardarGrupo(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "grupoId"
        )?.value || "";


    const codigo =
        document.getElementById(
            "codigoGrupo"
        )?.value
            ?.trim()
            .toUpperCase()
        || "";


    const semestre =
        Number(
            document.getElementById(
                "semestreGrupo"
            )?.value
            || 0
        );


    const activo =
        document.getElementById(
            "grupoActivo"
        )?.checked ?? true;


    const boton =
        document.getElementById(
            "btnGuardarGrupo"
        );


    mostrarMensajeAdmin(
        "mensajeGrupo",
        ""
    );


    if (
        !codigo
        ||
        !semestre
    ) {

        mostrarMensajeAdmin(
            "mensajeGrupo",
            "Completa los datos del grupo."
        );


        return;

    }


    if (boton) {

        boton.disabled =
            true;


        boton.textContent =
            "GUARDANDO...";

    }


    try {

        let resultado;


        if (id) {

            resultado =
                await supabaseClient.rpc(
                    "editar_grupo_estudiantes",
                    {
                        p_grupo_id:
                            Number(id),

                        p_codigo_grupo:
                            codigo,

                        p_semestre:
                            semestre,

                        p_activo:
                            activo
                    }
                );

        }
        else {

            resultado =
                await supabaseClient.rpc(
                    "crear_grupo_estudiantes",
                    {
                        p_codigo_grupo:
                            codigo,

                        p_semestre:
                            semestre
                    }
                );

        }


        if (resultado.error) {

            throw resultado.error;

        }


        cerrarFormularioGrupo();


        await Promise.all([
            cargarGrupos(),
            cargarEstadisticas()
        ]);

    }
    catch (error) {

        console.error(
            "Error guardando grupo:",
            error
        );


        mostrarMensajeAdmin(
            "mensajeGrupo",
            obtenerMensajeError(
                error
            )
        );

    }
    finally {

        if (boton) {

            boton.disabled =
                false;


            boton.textContent =
                "GUARDAR";

        }

    }

}


// ============================================================
// CERRAR FORMULARIO GRUPO
// ============================================================

function cerrarFormularioGrupo() {

    document
        .getElementById(
            "formularioGrupoContenedor"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "formGrupo"
        )
        ?.reset();


    const grupoId =
        document.getElementById(
            "grupoId"
        );


    if (grupoId) {

        grupoId.value =
            "";

    }


    mostrarMensajeAdmin(
        "mensajeGrupo",
        ""
    );

}
// ============================================================
// SELECCIONAR GRUPO
// ============================================================

async function seleccionarGrupo(id) {

    const grupo =
        grupos.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!grupo) {
        return;
    }


    grupoSeleccionado = grupo;

    renderizarGrupos();


    document
        .getElementById("panelEstudiantesGrupo")
        ?.classList.remove("oculto");


    const titulo =
        document.getElementById(
            "tituloGrupoSeleccionado"
        );


    const semestre =
        document.getElementById(
            "semestreGrupoSeleccionado"
        );


    if (titulo) {
        titulo.textContent =
            grupo.codigo_grupo;
    }


    if (semestre) {
        semestre.textContent =
            `${grupo.semestre}° semestre`;
    }


    cerrarFormularioEstudiante();

    cerrarImportacionExcel();

    cerrarPromocion();


    await cargarEstudiantesGrupo();


    document
        .getElementById("panelEstudiantesGrupo")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


// ============================================================
// CARGAR ESTUDIANTES
// ============================================================

async function cargarEstudiantesGrupo() {

    if (!grupoSeleccionado) {
        return;
    }


    const contenedor =
        document.getElementById(
            "listaEstudiantes"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `

        <p class="estado-carga">
            Cargando estudiantes...
        </p>

    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("estudiantes_ceta")
                .select(
                    "id, codigo_ceta, nombre, grupo_id, estado, activo"
                )
                .eq(
                    "grupo_id",
                    grupoSeleccionado.id
                )
                .eq(
                    "estado",
                    "estudiante"
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


        estudiantesGrupo =
            data || [];


        renderizarEstudiantes();

    }
    catch (error) {

        console.error(
            "Error cargando estudiantes:",
            error
        );


        contenedor.innerHTML = `

            <p class="mensaje error">
                No se pudieron cargar los estudiantes.
            </p>

        `;

    }

}


// ============================================================
// MOSTRAR ESTUDIANTES
// ============================================================

function renderizarEstudiantes() {

    const contenedor =
        document.getElementById(
            "listaEstudiantes"
        );


    if (!contenedor) {
        return;
    }


    const buscador =
        document.getElementById(
            "buscarEstudiante"
        );


    const busqueda =
        buscador?.value
            ?.trim()
            .toLowerCase()
        || "";


    const lista =
        estudiantesGrupo.filter(
            estudiante => {

                const nombre =
                    String(
                        estudiante.nombre || ""
                    ).toLowerCase();


                const codigo =
                    String(
                        estudiante.codigo_ceta || ""
                    ).toLowerCase();


                return (
                    nombre.includes(busqueda)
                    ||
                    codigo.includes(busqueda)
                );

            }
        );


    contenedor.innerHTML = `

        <div class="tabla-responsive">

            <table class="tabla-admin">

                <thead>

                    <tr>

                        <th>
                            Código CETA
                        </th>

                        <th>
                            Nombre
                        </th>

                        <th>
                            Estado
                        </th>

                        <th>
                            Acciones
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        lista.length === 0

                            ? `

                                <tr>

                                    <td
                                        colspan="4"
                                        class="tabla-vacia"
                                    >

                                        ${
                                            busqueda
                                                ? "No se encontraron estudiantes."
                                                : "Este grupo no tiene estudiantes registrados."
                                        }

                                    </td>

                                </tr>

                            `

                            :

                            lista
                                .map(
                                    estudiante => `

                                        <tr>

                                            <td>

                                                <strong>

                                                    ${escaparHTML(
                                                        estudiante.codigo_ceta
                                                    )}

                                                </strong>

                                            </td>


                                            <td>

                                                ${escaparHTML(
                                                    estudiante.nombre
                                                )}

                                            </td>


                                            <td>

                                                <span
                                                    class="estado-badge ${
                                                        estudiante.activo
                                                            ? "activo"
                                                            : "inactivo"
                                                    }"
                                                >

                                                    ${
                                                        estudiante.activo
                                                            ? "Activo"
                                                            : "Inactivo"
                                                    }

                                                </span>

                                            </td>


                                            <td class="acciones-tabla">

                                                <button
                                                    type="button"
                                                    class="btn-icono"
                                                    title="Editar estudiante"
                                                    onclick="editarEstudiante(${estudiante.id})"
                                                >

                                                    ✏️

                                                </button>

                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

}


// ============================================================
// NUEVO ESTUDIANTE
// ============================================================

function prepararNuevoEstudiante() {

    if (!grupoSeleccionado) {
        return;
    }


    document
        .getElementById("formEstudianteAdmin")
        ?.reset();


    const estudianteId =
        document.getElementById(
            "estudianteId"
        );


    if (estudianteId) {
        estudianteId.value = "";
    }


    const activo =
        document.getElementById(
            "estudianteActivo"
        );


    if (activo) {
        activo.checked = true;
    }


    document
        .getElementById(
            "contenedorEstudianteActivo"
        )
        ?.classList.add("oculto");


    const titulo =
        document.getElementById(
            "tituloFormularioEstudiante"
        );


    if (titulo) {

        titulo.textContent =
            `Agregar estudiante a ${grupoSeleccionado.codigo_grupo}`;

    }


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );


    document
        .getElementById(
            "formularioEstudianteContenedor"
        )
        ?.classList.remove("oculto");


    document
        .getElementById(
            "codigoCetaAdmin"
        )
        ?.focus();

}


// ============================================================
// EDITAR ESTUDIANTE
// ============================================================

function editarEstudiante(id) {

    const estudiante =
        estudiantesGrupo.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!estudiante) {
        return;
    }


    const estudianteId =
        document.getElementById(
            "estudianteId"
        );


    const codigo =
        document.getElementById(
            "codigoCetaAdmin"
        );


    const nombre =
        document.getElementById(
            "nombreEstudiante"
        );


    const activo =
        document.getElementById(
            "estudianteActivo"
        );


    if (estudianteId) {
        estudianteId.value =
            estudiante.id;
    }


    if (codigo) {
        codigo.value =
            estudiante.codigo_ceta || "";
    }


    if (nombre) {
        nombre.value =
            estudiante.nombre || "";
    }


    if (activo) {
        activo.checked =
            Boolean(estudiante.activo);
    }


    document
        .getElementById(
            "contenedorEstudianteActivo"
        )
        ?.classList.remove("oculto");


    const titulo =
        document.getElementById(
            "tituloFormularioEstudiante"
        );


    if (titulo) {
        titulo.textContent =
            "Editar estudiante";
    }


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );


    const formulario =
        document.getElementById(
            "formularioEstudianteContenedor"
        );


    formulario?.classList.remove(
        "oculto"
    );


    formulario?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// GUARDAR ESTUDIANTE
// ============================================================

async function guardarEstudiante(event) {

    event.preventDefault();


    if (!grupoSeleccionado) {
        return;
    }


    const id =
        document.getElementById(
            "estudianteId"
        )?.value || "";


    const codigo =
        document.getElementById(
            "codigoCetaAdmin"
        )?.value
            ?.trim()
        || "";


    const nombre =
        document.getElementById(
            "nombreEstudiante"
        )?.value
            ?.trim()
        || "";


    const activo =
        document.getElementById(
            "estudianteActivo"
        )?.checked ?? true;


    const boton =
        document.getElementById(
            "btnGuardarEstudiante"
        );


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );


    if (!codigo || !nombre) {

        mostrarMensajeAdmin(
            "mensajeEstudianteAdmin",
            "Completa código CETA y nombre."
        );

        return;

    }


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "GUARDANDO...";

    }


    try {

        let resultado;


        if (id) {

            resultado =
                await supabaseClient.rpc(
                    "editar_estudiante_ceta",
                    {
                        p_estudiante_id:
                            Number(id),

                        p_codigo_ceta:
                            codigo,

                        p_nombre:
                            nombre,

                        p_grupo_id:
                            grupoSeleccionado.id,

                        p_activo:
                            activo
                    }
                );

        }
        else {

            resultado =
                await supabaseClient.rpc(
                    "crear_estudiante_ceta",
                    {
                        p_codigo_ceta:
                            codigo,

                        p_nombre:
                            nombre,

                        p_grupo_id:
                            grupoSeleccionado.id
                    }
                );

        }


        if (resultado.error) {
            throw resultado.error;
        }


        cerrarFormularioEstudiante();


        await Promise.all([
            cargarEstudiantesGrupo(),
            cargarEstadisticas()
        ]);

    }
    catch (error) {

        console.error(
            "Error guardando estudiante:",
            error
        );


        mostrarMensajeAdmin(
            "mensajeEstudianteAdmin",
            obtenerMensajeError(error)
        );

    }
    finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "GUARDAR";

        }

    }

}


// ============================================================
// CERRAR FORMULARIO ESTUDIANTE
// ============================================================

function cerrarFormularioEstudiante() {

    document
        .getElementById(
            "formularioEstudianteContenedor"
        )
        ?.classList.add("oculto");


    document
        .getElementById(
            "formEstudianteAdmin"
        )
        ?.reset();


    const estudianteId =
        document.getElementById(
            "estudianteId"
        );


    if (estudianteId) {
        estudianteId.value = "";
    }


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );

}


// ============================================================
// ABRIR IMPORTACIÓN EXCEL
// ============================================================

function abrirImportacionExcel() {

    if (!grupoSeleccionado) {
        return;
    }


    cerrarPromocion();


    estudiantesExcel = [];


    const archivo =
        document.getElementById(
            "archivoExcel"
        );


    if (archivo) {
        archivo.value = "";
    }


    const vista =
        document.getElementById(
            "vistaPreviaExcel"
        );


    if (vista) {
        vista.innerHTML = "";
    }


    document
        .getElementById(
            "resumenExcel"
        )
        ?.classList.add("oculto");


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );


    document
        .getElementById(
            "panelImportarExcel"
        )
        ?.classList.remove("oculto");

}


// ============================================================
// CERRAR IMPORTACIÓN EXCEL
// ============================================================

function cerrarImportacionExcel() {

    estudiantesExcel = [];


    document
        .getElementById(
            "panelImportarExcel"
        )
        ?.classList.add("oculto");


    const archivo =
        document.getElementById(
            "archivoExcel"
        );


    if (archivo) {
        archivo.value = "";
    }


    document
        .getElementById(
            "resumenExcel"
        )
        ?.classList.add("oculto");


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );

}
// ============================================================
// LEER ARCHIVO EXCEL
// ============================================================

async function leerArchivoExcel(event) {

    const archivo =
        event.target.files?.[0];


    estudiantesExcel = [];


    document
        .getElementById(
            "resumenExcel"
        )
        ?.classList.add("oculto");


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );


    if (!archivo) {
        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        mostrarMensajeAdmin(
            "mensajeExcel",
            "No se pudo cargar la librería para leer archivos Excel."
        );

        return;

    }


    try {

        const buffer =
            await archivo.arrayBuffer();


        const libro =
            XLSX.read(
                buffer,
                {
                    type: "array"
                }
            );


        if (
            !libro.SheetNames
            ||
            libro.SheetNames.length === 0
        ) {

            throw new Error(
                "El archivo Excel no contiene hojas."
            );

        }


        const primeraHoja =
            libro.Sheets[
                libro.SheetNames[0]
            ];


        const filas =
            XLSX.utils.sheet_to_json(
                primeraHoja,
                {
                    defval: "",
                    raw: false
                }
            );


        if (!filas.length) {

            throw new Error(
                "El archivo Excel está vacío."
            );

        }


        estudiantesExcel =
            normalizarEstudiantesExcel(
                filas
            );


        if (!estudiantesExcel.length) {

            throw new Error(
                "No se encontraron estudiantes válidos. Verifica que el archivo tenga columnas de nombre y código CETA."
            );

        }


        renderizarVistaPreviaExcel();


        mostrarMensajeAdmin(
            "mensajeExcel",
            `Archivo leído correctamente: ${estudiantesExcel.length} estudiantes.`,
            "exito"
        );

    }
    catch (error) {

        console.error(
            "Error leyendo Excel:",
            error
        );


        estudiantesExcel = [];


        mostrarMensajeAdmin(
            "mensajeExcel",
            obtenerMensajeError(error)
        );

    }

}


// ============================================================
// NORMALIZAR COLUMNAS DEL EXCEL
// ============================================================

function normalizarEstudiantesExcel(filas) {

    const resultado = [];

    const codigosUsados =
        new Set();


    for (const fila of filas) {

        const claves =
            Object.keys(fila);


        let claveNombre =
            claves.find(
                clave => {

                    const normalizada =
                        normalizarTextoExcel(
                            clave
                        );


                    return (
                        normalizada === "nombre"
                        ||
                        normalizada === "nombres"
                        ||
                        normalizada === "nombre completo"
                        ||
                        normalizada === "estudiante"
                        ||
                        normalizada === "alumno"
                    );

                }
            );


        let claveCodigo =
            claves.find(
                clave => {

                    const normalizada =
                        normalizarTextoExcel(
                            clave
                        );


                    return (
                        normalizada === "codigo"
                        ||
                        normalizada === "codigo ceta"
                        ||
                        normalizada === "codigoceta"
                        ||
                        normalizada === "codigo_ceta"
                        ||
                        normalizada === "cod ceta"
                    );

                }
            );


        // ----------------------------------------------------
        // Si los títulos no coinciden exactamente,
        // buscamos parcialmente.
        // ----------------------------------------------------

        if (!claveNombre) {

            claveNombre =
                claves.find(
                    clave =>
                        normalizarTextoExcel(
                            clave
                        ).includes(
                            "nombre"
                        )
                );

        }


        if (!claveCodigo) {

            claveCodigo =
                claves.find(
                    clave => {

                        const texto =
                            normalizarTextoExcel(
                                clave
                            );


                        return (
                            texto.includes(
                                "codigo"
                            )
                            ||
                            texto.includes(
                                "ceta"
                            )
                        );

                    }
                );

        }


        if (
            !claveNombre
            ||
            !claveCodigo
        ) {

            continue;

        }


        const nombre =
            String(
                fila[claveNombre] ?? ""
            )
            .trim();


        const codigo =
            String(
                fila[claveCodigo] ?? ""
            )
            .trim()
            .toUpperCase();


        if (
            !nombre
            ||
            !codigo
        ) {

            continue;

        }


        // Evitar códigos duplicados dentro del mismo Excel.

        if (
            codigosUsados.has(
                codigo
            )
        ) {

            continue;

        }


        codigosUsados.add(
            codigo
        );


        resultado.push({

            nombre:
                nombre,

            codigo_ceta:
                codigo

        });

    }


    return resultado;

}


// ============================================================
// NORMALIZAR TEXTO DE CABECERAS EXCEL
// ============================================================

function normalizarTextoExcel(texto) {

    return String(
        texto ?? ""
    )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .replace(
        /[_-]+/g,
        " "
    )
    .replace(
        /\s+/g,
        " "
    );

}


// ============================================================
// VISTA PREVIA DEL EXCEL
// ============================================================

function renderizarVistaPreviaExcel() {

    const resumen =
        document.getElementById(
            "resumenExcel"
        );


    const cantidad =
        document.getElementById(
            "cantidadExcel"
        );


    const vista =
        document.getElementById(
            "vistaPreviaExcel"
        );


    if (cantidad) {

        cantidad.textContent =
            `${estudiantesExcel.length} ${
                estudiantesExcel.length === 1
                    ? "estudiante"
                    : "estudiantes"
            }`;

    }


    if (vista) {

        vista.innerHTML = `

            <table class="tabla-admin">

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            Nombre
                        </th>

                        <th>
                            Código CETA
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        estudiantesExcel
                            .map(
                                (
                                    estudiante,
                                    indice
                                ) => `

                                    <tr>

                                        <td>
                                            ${indice + 1}
                                        </td>


                                        <td>

                                            ${escaparHTML(
                                                estudiante.nombre
                                            )}

                                        </td>


                                        <td>

                                            <strong>

                                                ${escaparHTML(
                                                    estudiante.codigo_ceta
                                                )}

                                            </strong>

                                        </td>

                                    </tr>

                                `
                            )
                            .join("")
                    }

                </tbody>

            </table>

        `;

    }


    resumen?.classList.remove(
        "oculto"
    );

}


// ============================================================
// CONFIRMAR IMPORTACIÓN DEL EXCEL
// ============================================================

async function confirmarImportacionExcel() {

    if (!grupoSeleccionado) {

        mostrarMensajeAdmin(
            "mensajeExcel",
            "No hay un grupo seleccionado."
        );

        return;

    }


    if (!estudiantesExcel.length) {

        mostrarMensajeAdmin(
            "mensajeExcel",
            "Primero selecciona un archivo Excel válido."
        );

        return;

    }


    const confirmar =
        window.confirm(

            `Se reemplazará la lista actual del grupo ${grupoSeleccionado.codigo_grupo} por ${estudiantesExcel.length} estudiantes.\n\n¿Deseas continuar?`

        );


    if (!confirmar) {
        return;
    }


    const boton =
        document.getElementById(
            "btnConfirmarExcel"
        );


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "IMPORTANDO...";

    }


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );


    try {

        // ----------------------------------------------------
        // El RPC espera un JSON con los estudiantes.
        // ----------------------------------------------------

        const listaJson =
            estudiantesExcel.map(
                estudiante => ({

                    codigo_ceta:
                        estudiante.codigo_ceta,

                    nombre:
                        estudiante.nombre

                })
            );


        const {
            error
        } =
            await supabaseClient.rpc(
                "reemplazar_lista_grupo_estudiantes",
                {
                    p_grupo_id:
                        grupoSeleccionado.id,

                    p_estudiantes:
                        listaJson
                }
            );


        if (error) {
            throw error;
        }


        mostrarMensajeAdmin(
            "mensajeExcel",
            "Lista importada correctamente.",
            "exito"
        );


        estudiantesExcel = [];


        const archivo =
            document.getElementById(
                "archivoExcel"
            );


        if (archivo) {
            archivo.value = "";
        }


        document
            .getElementById(
                "resumenExcel"
            )
            ?.classList.add("oculto");


        await Promise.all([

            cargarEstudiantesGrupo(),

            cargarEstadisticas()

        ]);


        setTimeout(
            () => {

                cerrarImportacionExcel();

            },
            800
        );

    }
    catch (error) {

        console.error(
            "Error importando lista:",
            error
        );


        mostrarMensajeAdmin(
            "mensajeExcel",
            obtenerMensajeError(error)
        );

    }
    finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "CONFIRMAR IMPORTACIÓN";

        }

    }

}


// ============================================================
// PROMOCIÓN DE GRUPOS
// ============================================================

function prepararPromocionGrupo() {

    if (!grupoSeleccionado) {
        return;
    }


    cerrarImportacionExcel();


    grupoDestinoPromocion =
        null;


    const panel =
        document.getElementById(
            "panelPromocion"
        );


    const contenido =
        document.getElementById(
            "contenidoPromocion"
        );


    const botonConfirmar =
        document.getElementById(
            "btnConfirmarPromocion"
        );


    if (
        !panel
        ||
        !contenido
    ) {

        console.error(
            "No se encontró el panel de promoción."
        );

        return;

    }


    mostrarMensajeAdmin(
        "mensajePromocion",
        ""
    );


    // ========================================================
    // SEXTO SEMESTRE -> EGRESADOS
    // ========================================================

    if (
        Number(
            grupoSeleccionado.semestre
        ) === 6
    ) {

        if (botonConfirmar) {

            botonConfirmar.classList.remove(
                "oculto"
            );

        }


        contenido.innerHTML = `

            <div class="promocion-resumen">

                <div>

                    <small>
                        GRUPO ACTUAL
                    </small>

                    <strong>

                        ${escaparHTML(
                            grupoSeleccionado.codigo_grupo
                        )}

                    </strong>

                    <span>
                        6° semestre
                    </span>

                </div>


                <div class="flecha-promocion">
                    →
                </div>


                <div>

                    <small>
                        DESTINO
                    </small>

                    <strong>
                        🎓 EGRESADOS
                    </strong>

                    <span>
                        Acceso completo 1°–6°
                    </span>

                </div>

            </div>


            <div class="aviso-importante">

                Los estudiantes activos de

                <strong>

                    ${escaparHTML(
                        grupoSeleccionado.codigo_grupo
                    )}

                </strong>

                pasarán a estado

                <strong>
                    egresado
                </strong>

                y dejarán de pertenecer al grupo.

            </div>

        `;


        panel.classList.remove(
            "oculto"
        );


        panel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        return;

    }


    // ========================================================
    // SEMESTRES 1 A 5
    // ========================================================

    const siguienteSemestre =
        Number(
            grupoSeleccionado.semestre
        ) + 1;


    const destinos =
        grupos.filter(
            grupo =>
                Boolean(
                    grupo.activo
                )
                &&
                Number(
                    grupo.semestre
                ) === siguienteSemestre
                &&
                Number(
                    grupo.id
                ) !==
                Number(
                    grupoSeleccionado.id
                )
        );


    if (!destinos.length) {

        contenido.innerHTML = `

            <div class="aviso-importante">

                No existe ningún grupo activo de

                <strong>
                    ${siguienteSemestre}° semestre
                </strong>.

                <br><br>

                Primero crea el grupo de destino
                y luego vuelve a realizar la promoción.

            </div>

        `;


        botonConfirmar
            ?.classList.add(
                "oculto"
            );

    }
    else {

        botonConfirmar
            ?.classList.remove(
                "oculto"
            );


        contenido.innerHTML = `

            <div class="promocion-resumen">

                <div>

                    <small>
                        ORIGEN
                    </small>

                    <strong>

                        ${escaparHTML(
                            grupoSeleccionado.codigo_grupo
                        )}

                    </strong>

                    <span>

                        ${grupoSeleccionado.semestre}° semestre

                    </span>

                </div>


                <div class="flecha-promocion">
                    →
                </div>


                <div>

                    <small>
                        DESTINO
                    </small>


                    <select
                        id="selectGrupoDestino"
                        class="select-promocion"
                    >

                        <option value="">
                            Seleccionar grupo
                        </option>


                        ${
                            destinos
                                .map(
                                    grupo => `

                                        <option
                                            value="${grupo.id}"
                                        >

                                            ${escaparHTML(
                                                grupo.codigo_grupo
                                            )}

                                            — ${grupo.semestre}° semestre

                                        </option>

                                    `
                                )
                                .join("")
                        }

                    </select>

                </div>

            </div>


            <div class="aviso-importante">

                Todos los estudiantes

                <strong>
                    activos
                </strong>

                del grupo serán trasladados
                al grupo seleccionado.

            </div>

        `;

    }


    panel.classList.remove(
        "oculto"
    );


    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// CERRAR PROMOCIÓN
// ============================================================

function cerrarPromocion() {

    grupoDestinoPromocion =
        null;


    document
        .getElementById(
            "panelPromocion"
        )
        ?.classList.add(
            "oculto"
        );


    const contenido =
        document.getElementById(
            "contenidoPromocion"
        );


    if (contenido) {

        contenido.innerHTML = "";

    }


    document
        .getElementById(
            "btnConfirmarPromocion"
        )
        ?.classList.remove(
            "oculto"
        );


    mostrarMensajeAdmin(
        "mensajePromocion",
        ""
    );

}


// ============================================================
// CONFIRMAR PROMOCIÓN
// ============================================================

async function confirmarPromocionGrupo() {

    if (!grupoSeleccionado) {
        return;
    }


    const boton =
        document.getElementById(
            "btnConfirmarPromocion"
        );


    mostrarMensajeAdmin(
        "mensajePromocion",
        ""
    );


    // ========================================================
    // SEXTO SEMESTRE -> EGRESADOS
    // ========================================================

    if (
        Number(
            grupoSeleccionado.semestre
        ) === 6
    ) {

        const confirmar =
            window.confirm(

                `Los estudiantes activos de ${grupoSeleccionado.codigo_grupo} pasarán a EGRESADOS.\n\n¿Deseas continuar?`

            );


        if (!confirmar) {
            return;
        }


        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "PROCESANDO...";

        }


        try {

            const {
                error
            } =
                await supabaseClient.rpc(
                    "promover_grupo_a_egresados",
                    {
                        p_grupo_id:
                            grupoSeleccionado.id
                    }
                );


            if (error) {
                throw error;
            }


            mostrarMensajeAdmin(
                "mensajePromocion",
                "Los estudiantes fueron promovidos a egresados correctamente.",
                "exito"
            );


            await Promise.all([

                cargarEstudiantesGrupo(),

                cargarEstadisticas()

            ]);


            setTimeout(
                () => {

                    cerrarPromocion();

                },
                900
            );

        }
        catch (error) {

            console.error(
                "Error promoviendo a egresados:",
                error
            );


            mostrarMensajeAdmin(
                "mensajePromocion",
                obtenerMensajeError(error)
            );

        }
        finally {

            if (boton) {

                boton.disabled = false;

                boton.textContent =
                    "CONFIRMAR PROMOCIÓN";

            }

        }


        return;

    }


    // ========================================================
    // GRUPO -> SIGUIENTE SEMESTRE
    // ========================================================

    const selectDestino =
        document.getElementById(
            "selectGrupoDestino"
        );


    const destinoId =
        Number(
            selectDestino?.value || 0
        );


    if (!destinoId) {

        mostrarMensajeAdmin(
            "mensajePromocion",
            "Selecciona el grupo de destino."
        );

        return;

    }


    const grupoDestino =
        grupos.find(
            grupo =>
                Number(
                    grupo.id
                ) === destinoId
        );


    if (!grupoDestino) {

        mostrarMensajeAdmin(
            "mensajePromocion",
            "El grupo de destino no es válido."
        );

        return;

    }


    grupoDestinoPromocion =
        grupoDestino;


    const confirmar =
        window.confirm(

            `Los estudiantes activos de ${grupoSeleccionado.codigo_grupo} serán trasladados a ${grupoDestino.codigo_grupo}.\n\n¿Deseas continuar?`

        );


    if (!confirmar) {
        return;
    }


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "PROCESANDO...";

    }


    try {

        const grupoOrigenId =
            grupoSeleccionado.id;


        const {
            error
        } =
            await supabaseClient.rpc(
                "promover_grupo_estudiantes",
                {
                    p_grupo_origen_id:
                        grupoOrigenId,

                    p_grupo_destino_id:
                        grupoDestino.id
                }
            );


        if (error) {
            throw error;
        }


        mostrarMensajeAdmin(
            "mensajePromocion",
            `Grupo promovido correctamente a ${grupoDestino.codigo_grupo}.`,
            "exito"
        );


        await Promise.all([

            cargarEstudiantesGrupo(),

            cargarGrupos(),

            cargarEstadisticas()

        ]);


        setTimeout(
            () => {

                cerrarPromocion();

            },
            900
        );

    }
    catch (error) {

        console.error(
            "Error promoviendo grupo:",
            error
        );


        mostrarMensajeAdmin(
            "mensajePromocion",
            obtenerMensajeError(error)
        );

    }
    finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "CONFIRMAR PROMOCIÓN";

        }

    }

}
// ============================================================
// SELECCIONAR SEMESTRE DE MATERIAL
// ============================================================

async function seleccionarSemestreMaterial(semestre) {

    semestre =
        Number(semestre);


    if (
        semestre < 1
        ||
        semestre > 6
    ) {
        return;
    }


    semestreMaterialActual =
        semestre;


    // --------------------------------------------------------
    // ACTUALIZAR BOTONES DE SEMESTRE
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".btn-semestre"
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


    // --------------------------------------------------------
    // ACTUALIZAR TÍTULO
    // --------------------------------------------------------

    const titulo =
        document.getElementById(
            "tituloSemestreMaterial"
        );


    if (titulo) {

        titulo.textContent =
            `${semestre}° semestre`;

    }


    // --------------------------------------------------------
    // CERRAR MATERIA ABIERTA
    // --------------------------------------------------------

    materiaAbierta =
        null;


    seccionActual =
        null;


    rutaSecciones =
        [];


    seccionesMateria =
        [];


    materialesSeccionActual =
        [];


    document
        .getElementById(
            "panelMateriaAbierta"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "panelListaMaterias"
        )
        ?.classList.remove(
            "oculto"
        );


    cerrarFormularioMateria();


    await cargarMaterias();

}


// ============================================================
// CARGAR MATERIAS
// ============================================================

async function cargarMaterias() {

    const contenedor =
        document.getElementById(
            "listaMaterias"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `

        <p class="estado-carga">
            Cargando materias...
        </p>

    `;


    const titulo =
        document.getElementById(
            "tituloSemestreMaterial"
        );


    if (titulo) {

        titulo.textContent =
            `${semestreMaterialActual}° semestre`;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "materias_estudiantes"
                )
                .select(
                    "id, nombre, semestre, descripcion, orden, activo, created_at"
                )
                .eq(
                    "semestre",
                    semestreMaterialActual
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


        materiasMaterial =
            data || [];


        renderizarMaterias();

    }
    catch (error) {

        console.error(
            "Error cargando materias:",
            error
        );


        contenedor.innerHTML = `

            <p class="mensaje error">
                No se pudieron cargar las materias.
            </p>

        `;

    }

}


// ============================================================
// MOSTRAR MATERIAS
// ============================================================

function renderizarMaterias() {

    const contenedor =
        document.getElementById(
            "listaMaterias"
        );


    if (!contenedor) {
        return;
    }


    if (!materiasMaterial.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <span>
                    📚
                </span>

                <strong>
                    No existen materias
                </strong>

                <p>
                    Todavía no se registraron materias
                    para ${semestreMaterialActual}° semestre.
                </p>

            </div>

        `;


        return;

    }


    contenedor.innerHTML =
        materiasMaterial
            .map(
                materia => `

                    <article class="materia-card">

                        <button
                            type="button"
                            class="materia-card-principal"
                            onclick="abrirMateria(${materia.id})"
                        >

                            <div class="materia-card-icono">
                                📘
                            </div>


                            <div class="materia-card-info">

                                <strong>

                                    ${escaparHTML(
                                        materia.nombre
                                    )}

                                </strong>


                                ${
                                    materia.descripcion

                                        ? `

                                            <p>

                                                ${escaparHTML(
                                                    materia.descripcion
                                                )}

                                            </p>

                                        `

                                        : ""
                                }


                                <small>

                                    Orden:
                                    ${Number(
                                        materia.orden || 0
                                    )}

                                </small>

                            </div>


                            <span
                                class="estado-badge ${
                                    materia.activo
                                        ? "activo"
                                        : "inactivo"
                                }"
                            >

                                ${
                                    materia.activo
                                        ? "Activa"
                                        : "Inactiva"
                                }

                            </span>

                        </button>


                        <div class="acciones-card">

                            <button
                                type="button"
                                class="btn-icono"
                                title="Editar materia"
                                onclick="editarMateria(${materia.id})"
                            >
                                ✏️
                            </button>

                        </div>

                    </article>

                `
            )
            .join("");

}


// ============================================================
// PREPARAR NUEVA MATERIA
// ============================================================

function prepararNuevaMateria() {

    // --------------------------------------------------------
    // REINICIAR FORMULARIO
    // --------------------------------------------------------

    document
        .getElementById(
            "formMateria"
        )
        ?.reset();


    const materiaId =
        document.getElementById(
            "materiaId"
        );


    const nombre =
        document.getElementById(
            "nombreMateria"
        );


    const descripcion =
        document.getElementById(
            "descripcionMateria"
        );


    const orden =
        document.getElementById(
            "ordenMateria"
        );


    const activa =
        document.getElementById(
            "materiaActiva"
        );


    const contenedorActiva =
        document.getElementById(
            "contenedorMateriaActiva"
        );


    const titulo =
        document.getElementById(
            "tituloFormularioMateria"
        );


    const formulario =
        document.getElementById(
            "formularioMateria"
        );


    // --------------------------------------------------------
    // VALORES NUEVA MATERIA
    // --------------------------------------------------------

    if (materiaId) {

        materiaId.value = "";

    }


    if (nombre) {

        nombre.value = "";

    }


    if (descripcion) {

        descripcion.value = "";

    }


    if (orden) {

        orden.value = "0";

    }


    if (activa) {

        activa.checked = true;

    }


    // Al crear no necesitamos mostrar "Materia activa".

    contenedorActiva
        ?.classList.add(
            "oculto"
        );


    if (titulo) {

        titulo.textContent =
            `Nueva materia — ${semestreMaterialActual}° semestre`;

    }


    mostrarMensajeAdmin(
        "mensajeMateria",
        ""
    );


    formulario
        ?.classList.remove(
            "oculto"
        );


    formulario
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    nombre?.focus();

}


// ============================================================
// EDITAR MATERIA
// ============================================================

function editarMateria(id) {

    const materia =
        materiasMaterial.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!materia) {
        return;
    }


    const materiaId =
        document.getElementById(
            "materiaId"
        );


    const nombre =
        document.getElementById(
            "nombreMateria"
        );


    const descripcion =
        document.getElementById(
            "descripcionMateria"
        );


    const orden =
        document.getElementById(
            "ordenMateria"
        );


    const activa =
        document.getElementById(
            "materiaActiva"
        );


    const contenedorActiva =
        document.getElementById(
            "contenedorMateriaActiva"
        );


    const titulo =
        document.getElementById(
            "tituloFormularioMateria"
        );


    const formulario =
        document.getElementById(
            "formularioMateria"
        );


    // --------------------------------------------------------
    // CARGAR DATOS
    // --------------------------------------------------------

    if (materiaId) {

        materiaId.value =
            materia.id;

    }


    if (nombre) {

        nombre.value =
            materia.nombre || "";

    }


    if (descripcion) {

        descripcion.value =
            materia.descripcion || "";

    }


    if (orden) {

        orden.value =
            Number(
                materia.orden || 0
            );

    }


    if (activa) {

        activa.checked =
            Boolean(
                materia.activo
            );

    }


    contenedorActiva
        ?.classList.remove(
            "oculto"
        );


    if (titulo) {

        titulo.textContent =
            "Editar materia";

    }


    mostrarMensajeAdmin(
        "mensajeMateria",
        ""
    );


    formulario
        ?.classList.remove(
            "oculto"
        );


    formulario
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    nombre?.focus();

}


// ============================================================
// GUARDAR MATERIA
// ============================================================

async function guardarMateria(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "materiaId"
        )?.value || "";


    const nombre =
        document.getElementById(
            "nombreMateria"
        )?.value
            ?.trim()
        || "";


    const descripcion =
        document.getElementById(
            "descripcionMateria"
        )?.value
            ?.trim()
        || "";


    const orden =
        Number(
            document.getElementById(
                "ordenMateria"
            )?.value
            || 0
        );


    const activa =
        document.getElementById(
            "materiaActiva"
        )?.checked ?? true;


    const boton =
        document.getElementById(
            "btnGuardarMateria"
        );


    mostrarMensajeAdmin(
        "mensajeMateria",
        ""
    );


    if (!nombre) {

        mostrarMensajeAdmin(
            "mensajeMateria",
            "Escribe el nombre de la materia."
        );

        return;

    }


    if (
        semestreMaterialActual < 1
        ||
        semestreMaterialActual > 6
    ) {

        mostrarMensajeAdmin(
            "mensajeMateria",
            "El semestre seleccionado no es válido."
        );

        return;

    }


    if (boton) {

        boton.disabled =
            true;


        boton.textContent =
            "GUARDANDO...";

    }


    try {

        // ----------------------------------------------------
        // EDITAR
        // ----------------------------------------------------

        if (id) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "materias_estudiantes"
                    )
                    .update({

                        nombre:
                            nombre,

                        descripcion:
                            descripcion || null,

                        orden:
                            orden,

                        activo:
                            activa

                    })
                    .eq(
                        "id",
                        Number(id)
                    );


            if (error) {
                throw error;
            }

        }

        // ----------------------------------------------------
        // CREAR
        // ----------------------------------------------------

        else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "materias_estudiantes"
                    )
                    .insert({

                        nombre:
                            nombre,

                        semestre:
                            semestreMaterialActual,

                        descripcion:
                            descripcion || null,

                        orden:
                            orden,

                        activo:
                            true

                    });


            if (error) {
                throw error;
            }

        }


        cerrarFormularioMateria();


        await Promise.all([

            cargarMaterias(),

            cargarEstadisticas()

        ]);

    }
    catch (error) {

        console.error(
            "Error guardando materia:",
            error
        );


        mostrarMensajeAdmin(
            "mensajeMateria",
            obtenerMensajeError(error)
        );

    }
    finally {

        if (boton) {

            boton.disabled =
                false;


            boton.textContent =
                "GUARDAR";

        }

    }

}


// ============================================================
// CERRAR FORMULARIO MATERIA
// ============================================================

function cerrarFormularioMateria() {

    document
        .getElementById(
            "formularioMateria"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "formMateria"
        )
        ?.reset();


    const materiaId =
        document.getElementById(
            "materiaId"
        );


    if (materiaId) {

        materiaId.value = "";

    }


    const orden =
        document.getElementById(
            "ordenMateria"
        );


    if (orden) {

        orden.value = "0";

    }


    document
        .getElementById(
            "contenedorMateriaActiva"
        )
        ?.classList.add(
            "oculto"
        );


    mostrarMensajeAdmin(
        "mensajeMateria",
        ""
    );

}


// ============================================================
// ABRIR MATERIA
// ============================================================

async function abrirMateria(id) {

    const materia =
        materiasMaterial.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!materia) {
        return;
    }


    materiaAbierta =
        materia;


    seccionActual =
        null;


    rutaSecciones =
        [];


    seccionesMateria =
        [];


    materialesSeccionActual =
        [];


    cerrarFormularioMateria();


    document
        .getElementById(
            "panelListaMaterias"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "panelMateriaAbierta"
        )
        ?.classList.remove(
            "oculto"
        );


    const semestre =
        document.getElementById(
            "semestreMateriaAbierta"
        );


    const nombre =
        document.getElementById(
            "nombreMateriaAbierta"
        );


    if (semestre) {

        semestre.textContent =
            `${materia.semestre}° semestre`;

    }


    if (nombre) {

        nombre.textContent =
            materia.nombre;

    }


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    await cargarContenidoMateria();


    document
        .getElementById(
            "panelMateriaAbierta"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


// ============================================================
// VOLVER A LISTA DE MATERIAS
// ============================================================

function volverAListaMaterias() {

    materiaAbierta =
        null;


    seccionActual =
        null;


    rutaSecciones =
        [];


    seccionesMateria =
        [];


    materialesSeccionActual =
        [];


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    document
        .getElementById(
            "panelMateriaAbierta"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "panelListaMaterias"
        )
        ?.classList.remove(
            "oculto"
        );


    renderizarMaterias();

}
// ============================================================
// CARGAR CONTENIDO DE LA MATERIA
// ============================================================

async function cargarContenidoMateria() {

    if (!materiaAbierta) {
        return;
    }


    const contenedor =
        document.getElementById(
            "contenidoMateria"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `

        <p class="estado-carga">
            Cargando contenido...
        </p>

    `;


    try {

        // ----------------------------------------------------
        // CARGAR TODAS LAS CARPETAS DE LA MATERIA
        // ----------------------------------------------------

        const {
            data: secciones,
            error: errorSecciones
        } =
            await supabaseClient
                .from(
                    "secciones_material"
                )
                .select(
                    "id, materia_id, seccion_padre_id, nombre, orden, activo, created_at"
                )
                .eq(
                    "materia_id",
                    materiaAbierta.id
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


        if (errorSecciones) {
            throw errorSecciones;
        }


        seccionesMateria =
            secciones || [];


        // ----------------------------------------------------
        // CARGAR MATERIAL
        // ----------------------------------------------------

        let consultaMaterial =
            supabaseClient
                .from(
                    "material_estudiantes"
                )
                .select(
                    "id, seccion_id, titulo, descripcion, tipo, url, orden, activo, created_at"
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


        // ----------------------------------------------------
        // MATERIAL DE LA CARPETA ACTUAL
        // ----------------------------------------------------

        if (seccionActual) {

            consultaMaterial =
                consultaMaterial.eq(
                    "seccion_id",
                    seccionActual.id
                );

        }
        else {

            /*
             * Los recursos están asociados a una sección.
             * En la raíz normalmente mostraremos carpetas.
             *
             * Si posteriormente decides permitir material
             * directamente en la raíz de una materia,
             * podremos adaptar la base de datos.
             */

            materialesSeccionActual = [];

        }


        if (seccionActual) {

            const {
                data: materiales,
                error: errorMateriales
            } =
                await consultaMaterial;


            if (errorMateriales) {
                throw errorMateriales;
            }


            materialesSeccionActual =
                materiales || [];

        }


        actualizarRutaMaterial();

        renderizarContenidoMateria();

    }
    catch (error) {

        console.error(
            "Error cargando contenido de materia:",
            error
        );


        contenedor.innerHTML = `

            <p class="mensaje error">
                No se pudo cargar el contenido de la materia.
            </p>

        `;

    }

}


// ============================================================
// OBTENER CARPETAS DE LA UBICACIÓN ACTUAL
// ============================================================

function obtenerCarpetasActuales() {

    if (!seccionActual) {

        return seccionesMateria.filter(
            seccion =>
                seccion.seccion_padre_id === null
        );

    }


    return seccionesMateria.filter(
        seccion =>
            Number(
                seccion.seccion_padre_id
            )
            ===
            Number(
                seccionActual.id
            )
    );

}


// ============================================================
// RENDERIZAR CONTENIDO DE MATERIA
// ============================================================

function renderizarContenidoMateria() {

    const contenedor =
        document.getElementById(
            "contenidoMateria"
        );


    if (!contenedor) {
        return;
    }


    const carpetas =
        obtenerCarpetasActuales();


    if (
        !carpetas.length
        &&
        !materialesSeccionActual.length
    ) {

        contenedor.innerHTML = `

            <div class="vacio">

                <span>
                    📂
                </span>

                <strong>
                    Esta ubicación está vacía
                </strong>

                <p>
                    Puedes crear una carpeta
                    o agregar material académico.
                </p>

            </div>

        `;


        return;

    }


    let html = "";


    // ========================================================
    // CARPETAS
    // ========================================================

    if (carpetas.length) {

        html += `

            <div class="lista-carpetas-material">

                ${
                    carpetas
                        .map(
                            carpeta => `

                                <article
                                    class="carpeta-material-card"
                                >

                                    <button
                                        type="button"
                                        class="carpeta-material-principal"
                                        onclick="abrirCarpeta(${carpeta.id})"
                                    >

                                        <span
                                            class="carpeta-material-icono"
                                        >
                                            📁
                                        </span>


                                        <div
                                            class="carpeta-material-info"
                                        >

                                            <strong>

                                                ${escaparHTML(
                                                    carpeta.nombre
                                                )}

                                            </strong>


                                            <small>

                                                ${
                                                    carpeta.activo
                                                        ? "Carpeta activa"
                                                        : "Carpeta inactiva"
                                                }

                                            </small>

                                        </div>

                                    </button>


                                    <div
                                        class="acciones-card"
                                    >

                                        <button
                                            type="button"
                                            class="btn-icono"
                                            title="Editar carpeta"
                                            onclick="editarCarpeta(${carpeta.id})"
                                        >
                                            ✏️
                                        </button>

                                    </div>

                                </article>

                            `
                        )
                        .join("")
                }

            </div>

        `;

    }


    // ========================================================
    // RECURSOS
    // ========================================================

    if (materialesSeccionActual.length) {

        html += `

            <div class="lista-recursos-material">

                ${
                    materialesSeccionActual
                        .map(
                            material => {

                                let icono = "🔗";


                                if (
                                    material.tipo ===
                                    "drive"
                                ) {

                                    icono = "📄";

                                }


                                if (
                                    material.tipo ===
                                    "video"
                                ) {

                                    icono = "▶️";

                                }


                                return `

                                    <article
                                        class="recurso-material-card"
                                    >

                                        <div
                                            class="recurso-material-icono"
                                        >

                                            ${icono}

                                        </div>


                                        <div
                                            class="recurso-material-info"
                                        >

                                            <strong>

                                                ${escaparHTML(
                                                    material.titulo
                                                )}

                                            </strong>


                                            ${
                                                material.descripcion

                                                    ? `

                                                        <p>

                                                            ${escaparHTML(
                                                                material.descripcion
                                                            )}

                                                        </p>

                                                    `

                                                    : ""
                                            }


                                            <small>

                                                ${
                                                    nombreTipoMaterial(
                                                        material.tipo
                                                    )
                                                }

                                                ·

                                                ${
                                                    material.activo
                                                        ? "Activo"
                                                        : "Inactivo"
                                                }

                                            </small>

                                        </div>


                                        <div
                                            class="acciones-card"
                                        >

                                            <a
                                                href="${escaparAtributo(
                                                    material.url
                                                )}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="btn-icono"
                                                title="Abrir material"
                                            >
                                                ↗
                                            </a>


                                            <button
                                                type="button"
                                                class="btn-icono"
                                                title="Editar material"
                                                onclick="editarMaterialAcademico(${material.id})"
                                            >
                                                ✏️
                                            </button>

                                        </div>

                                    </article>

                                `;

                            }
                        )
                        .join("")
                }

            </div>

        `;

    }


    contenedor.innerHTML =
        html;

}


// ============================================================
// ABRIR CARPETA
// ============================================================

async function abrirCarpeta(id) {

    const carpeta =
        seccionesMateria.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!carpeta) {
        return;
    }


    seccionActual =
        carpeta;


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    await cargarContenidoMateria();

}


// ============================================================
// VOLVER A UNA CARPETA DESDE LA RUTA
// ============================================================

async function navegarRutaMaterial(id) {

    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    // --------------------------------------------------------
    // RAÍZ DE LA MATERIA
    // --------------------------------------------------------

    if (
        id === null
        ||
        id === undefined
        ||
        id === ""
        ||
        id === "raiz"
    ) {

        seccionActual =
            null;


        materialesSeccionActual =
            [];


        await cargarContenidoMateria();

        return;

    }


    const carpeta =
        seccionesMateria.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!carpeta) {
        return;
    }


    seccionActual =
        carpeta;


    await cargarContenidoMateria();

}


// ============================================================
// CONSTRUIR RUTA DE CARPETAS
// ============================================================

function construirRutaSecciones() {

    rutaSecciones =
        [];


    if (!seccionActual) {
        return;
    }


    let actual =
        seccionActual;


    const idsVisitados =
        new Set();


    while (actual) {

        // Protección frente a ciclos accidentales.

        if (
            idsVisitados.has(
                Number(actual.id)
            )
        ) {

            console.warn(
                "Se detectó un ciclo entre carpetas."
            );

            break;

        }


        idsVisitados.add(
            Number(actual.id)
        );


        rutaSecciones.unshift(
            actual
        );


        if (
            actual.seccion_padre_id === null
            ||
            actual.seccion_padre_id === undefined
        ) {

            break;

        }


        actual =
            seccionesMateria.find(
                item =>
                    Number(item.id)
                    ===
                    Number(
                        actual.seccion_padre_id
                    )
            );

    }

}


// ============================================================
// ACTUALIZAR RUTA VISUAL
// ============================================================

function actualizarRutaMaterial() {

    const contenedor =
        document.getElementById(
            "rutaMaterial"
        );


    if (!contenedor) {
        return;
    }


    construirRutaSecciones();


    let html = `

        <button
            type="button"
            class="ruta-material-item"
            onclick="navegarRutaMaterial('raiz')"
        >

            📚

            ${escaparHTML(
                materiaAbierta?.nombre || "Materia"
            )}

        </button>

    `;


    rutaSecciones.forEach(
        (
            carpeta,
            indice
        ) => {

            html += `

                <span
                    class="ruta-material-separador"
                >
                    ›
                </span>

            `;


            const ultima =
                indice ===
                rutaSecciones.length - 1;


            if (ultima) {

                html += `

                    <span
                        class="ruta-material-actual"
                    >

                        📁

                        ${escaparHTML(
                            carpeta.nombre
                        )}

                    </span>

                `;

            }
            else {

                html += `

                    <button
                        type="button"
                        class="ruta-material-item"
                        onclick="navegarRutaMaterial(${carpeta.id})"
                    >

                        📁

                        ${escaparHTML(
                            carpeta.nombre
                        )}

                    </button>

                `;

            }

        }
    );


    contenedor.innerHTML =
        html;

}


// ============================================================
// PREPARAR NUEVA CARPETA
// ============================================================

function prepararNuevaCarpeta() {

    if (!materiaAbierta) {
        return;
    }


    document
        .getElementById(
            "formCarpeta"
        )
        ?.reset();


    const carpetaId =
        document.getElementById(
            "carpetaId"
        );


    const nombre =
        document.getElementById(
            "nombreCarpeta"
        );


    const orden =
        document.getElementById(
            "ordenCarpeta"
        );


    const activa =
        document.getElementById(
            "carpetaActiva"
        );


    const contenedorActiva =
        document.getElementById(
            "contenedorCarpetaActiva"
        );


    const titulo =
        document.getElementById(
            "tituloFormularioCarpeta"
        );


    const formulario =
        document.getElementById(
            "formularioCarpeta"
        );


    if (carpetaId) {
        carpetaId.value = "";
    }


    if (nombre) {
        nombre.value = "";
    }


    if (orden) {
        orden.value = "0";
    }


    if (activa) {
        activa.checked = true;
    }


    contenedorActiva
        ?.classList.add(
            "oculto"
        );


    if (titulo) {

        titulo.textContent =
            seccionActual
                ? `Nueva carpeta dentro de ${seccionActual.nombre}`
                : "Nueva carpeta";

    }


    mostrarMensajeAdmin(
        "mensajeCarpeta",
        ""
    );


    // No mostrar simultáneamente
    // formulario de material.

    cerrarFormularioMaterial();


    formulario
        ?.classList.remove(
            "oculto"
        );


    formulario
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    nombre?.focus();

}


// ============================================================
// EDITAR CARPETA
// ============================================================

function editarCarpeta(id) {

    const carpeta =
        seccionesMateria.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!carpeta) {
        return;
    }


    const carpetaId =
        document.getElementById(
            "carpetaId"
        );


    const nombre =
        document.getElementById(
            "nombreCarpeta"
        );


    const orden =
        document.getElementById(
            "ordenCarpeta"
        );


    const activa =
        document.getElementById(
            "carpetaActiva"
        );


    const titulo =
        document.getElementById(
            "tituloFormularioCarpeta"
        );


    const formulario =
        document.getElementById(
            "formularioCarpeta"
        );


    if (carpetaId) {

        carpetaId.value =
            carpeta.id;

    }


    if (nombre) {

        nombre.value =
            carpeta.nombre || "";

    }


    if (orden) {

        orden.value =
            Number(
                carpeta.orden || 0
            );

    }


    if (activa) {

        activa.checked =
            Boolean(
                carpeta.activo
            );

    }


    document
        .getElementById(
            "contenedorCarpetaActiva"
        )
        ?.classList.remove(
            "oculto"
        );


    if (titulo) {

        titulo.textContent =
            "Editar carpeta";

    }


    mostrarMensajeAdmin(
        "mensajeCarpeta",
        ""
    );


    cerrarFormularioMaterial();


    formulario
        ?.classList.remove(
            "oculto"
        );


    formulario
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    nombre?.focus();

}


// ============================================================
// GUARDAR CARPETA
// ============================================================

async function guardarCarpeta(event) {

    event.preventDefault();


    if (!materiaAbierta) {
        return;
    }


    const id =
        document.getElementById(
            "carpetaId"
        )?.value || "";


    const nombre =
        document.getElementById(
            "nombreCarpeta"
        )?.value
            ?.trim()
        || "";


    const orden =
        Number(
            document.getElementById(
                "ordenCarpeta"
            )?.value
            || 0
        );


    const activa =
        document.getElementById(
            "carpetaActiva"
        )?.checked ?? true;


    const boton =
        document.getElementById(
            "btnGuardarCarpeta"
        );


    mostrarMensajeAdmin(
        "mensajeCarpeta",
        ""
    );


    if (!nombre) {

        mostrarMensajeAdmin(
            "mensajeCarpeta",
            "Escribe el nombre de la carpeta."
        );

        return;

    }


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "GUARDANDO...";

    }


    try {

        // ====================================================
        // EDITAR CARPETA
        // ====================================================

        if (id) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "secciones_material"
                    )
                    .update({

                        nombre:
                            nombre,

                        orden:
                            orden,

                        activo:
                            activa

                    })
                    .eq(
                        "id",
                        Number(id)
                    );


            if (error) {
                throw error;
            }

        }

        // ====================================================
        // CREAR CARPETA
        // ====================================================

        else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "secciones_material"
                    )
                    .insert({

                        materia_id:
                            materiaAbierta.id,

                        seccion_padre_id:
                            seccionActual
                                ? seccionActual.id
                                : null,

                        nombre:
                            nombre,

                        orden:
                            orden,

                        activo:
                            true

                    });


            if (error) {
                throw error;
            }

        }


        cerrarFormularioCarpeta();


        await cargarContenidoMateria();

    }
    catch (error) {

        console.error(
            "Error guardando carpeta:",
            error
        );


        mostrarMensajeAdmin(
            "mensajeCarpeta",
            obtenerMensajeError(error)
        );

    }
    finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "GUARDAR";

        }

    }

}


// ============================================================
// CERRAR FORMULARIO CARPETA
// ============================================================

function cerrarFormularioCarpeta() {

    document
        .getElementById(
            "formularioCarpeta"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "formCarpeta"
        )
        ?.reset();


    const carpetaId =
        document.getElementById(
            "carpetaId"
        );


    if (carpetaId) {

        carpetaId.value = "";

    }


    const orden =
        document.getElementById(
            "ordenCarpeta"
        );


    if (orden) {

        orden.value = "0";

    }


    document
        .getElementById(
            "contenedorCarpetaActiva"
        )
        ?.classList.add(
            "oculto"
        );


    mostrarMensajeAdmin(
        "mensajeCarpeta",
        ""
    );

}


// ============================================================
// NOMBRE DEL TIPO DE MATERIAL
// ============================================================

function nombreTipoMaterial(tipo) {

    switch (tipo) {

        case "drive":
            return "Google Drive";

        case "video":
            return "Video";

        case "enlace":
            return "Enlace";

        default:
            return "Material";

    }

}


// ============================================================
// ESCAPAR VALOR PARA ATRIBUTO HTML
// ============================================================

function escaparAtributo(valor) {

    return escaparHTML(
        valor || ""
    );

}
// ============================================================
// PREPARAR NUEVO MATERIAL
// ============================================================

function prepararNuevoMaterial() {

    if (!materiaAbierta) {
        return;
    }


    // El material debe estar dentro de una carpeta.
    if (!seccionActual) {

        alert(
            "Primero abre una carpeta para agregar material académico."
        );

        return;

    }


    document
        .getElementById(
            "formMaterialAcademico"
        )
        ?.reset();


    const materialId =
        document.getElementById(
            "materialId"
        );


    const titulo =
        document.getElementById(
            "tituloMaterial"
        );


    const tipo =
        document.getElementById(
            "tipoMaterial"
        );


    const url =
        document.getElementById(
            "urlMaterial"
        );


    const descripcion =
        document.getElementById(
            "descripcionMaterial"
        );


    const orden =
        document.getElementById(
            "ordenMaterial"
        );


    const activo =
        document.getElementById(
            "materialActivo"
        );


    if (materialId) {
        materialId.value = "";
    }


    if (titulo) {
        titulo.value = "";
    }


    if (tipo) {
        tipo.value = "drive";
    }


    if (url) {
        url.value = "";
    }


    if (descripcion) {
        descripcion.value = "";
    }


    if (orden) {
        orden.value = "0";
    }


    if (activo) {
        activo.checked = true;
    }


    document
        .getElementById(
            "contenedorMaterialActivo"
        )
        ?.classList.add(
            "oculto"
        );


    const tituloFormulario =
        document.getElementById(
            "tituloFormularioMaterial"
        );


    if (tituloFormulario) {

        tituloFormulario.textContent =
            `Nuevo material — ${seccionActual.nombre}`;

    }


    mostrarMensajeAdmin(
        "mensajeMaterialAcademico",
        ""
    );


    // No mostrar ambos formularios a la vez.

    cerrarFormularioCarpeta();


    const formulario =
        document.getElementById(
            "formularioMaterial"
        );


    formulario
        ?.classList.remove(
            "oculto"
        );


    formulario
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    titulo?.focus();

}


// ============================================================
// EDITAR MATERIAL
// ============================================================

function editarMaterialAcademico(id) {

    const material =
        materialesSeccionActual.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!material) {
        return;
    }


    const materialId =
        document.getElementById(
            "materialId"
        );


    const titulo =
        document.getElementById(
            "tituloMaterial"
        );


    const tipo =
        document.getElementById(
            "tipoMaterial"
        );


    const url =
        document.getElementById(
            "urlMaterial"
        );


    const descripcion =
        document.getElementById(
            "descripcionMaterial"
        );


    const orden =
        document.getElementById(
            "ordenMaterial"
        );


    const activo =
        document.getElementById(
            "materialActivo"
        );


    if (materialId) {
        materialId.value =
            material.id;
    }


    if (titulo) {
        titulo.value =
            material.titulo || "";
    }


    if (tipo) {
        tipo.value =
            material.tipo || "drive";
    }


    if (url) {
        url.value =
            material.url || "";
    }


    if (descripcion) {
        descripcion.value =
            material.descripcion || "";
    }


    if (orden) {

        orden.value =
            Number(
                material.orden || 0
            );

    }


    if (activo) {

        activo.checked =
            Boolean(
                material.activo
            );

    }


    document
        .getElementById(
            "contenedorMaterialActivo"
        )
        ?.classList.remove(
            "oculto"
        );


    const tituloFormulario =
        document.getElementById(
            "tituloFormularioMaterial"
        );


    if (tituloFormulario) {

        tituloFormulario.textContent =
            "Editar material";

    }


    mostrarMensajeAdmin(
        "mensajeMaterialAcademico",
        ""
    );


    cerrarFormularioCarpeta();


    const formulario =
        document.getElementById(
            "formularioMaterial"
        );


    formulario
        ?.classList.remove(
            "oculto"
        );


    formulario
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    titulo?.focus();

}


// ============================================================
// GUARDAR MATERIAL
// ============================================================

async function guardarMaterialAcademico(event) {

    event.preventDefault();


    if (!materiaAbierta) {

        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            "No hay una materia seleccionada."
        );

        return;

    }


    if (!seccionActual) {

        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            "El material debe guardarse dentro de una carpeta."
        );

        return;

    }


    const id =
        document.getElementById(
            "materialId"
        )?.value || "";


    const titulo =
        document.getElementById(
            "tituloMaterial"
        )?.value
            ?.trim()
        || "";


    const tipo =
        document.getElementById(
            "tipoMaterial"
        )?.value
        || "drive";


    const url =
        document.getElementById(
            "urlMaterial"
        )?.value
            ?.trim()
        || "";


    const descripcion =
        document.getElementById(
            "descripcionMaterial"
        )?.value
            ?.trim()
        || "";


    const orden =
        Number(
            document.getElementById(
                "ordenMaterial"
            )?.value
            || 0
        );


    const activo =
        document.getElementById(
            "materialActivo"
        )?.checked ?? true;


    const boton =
        document.getElementById(
            "btnGuardarMaterial"
        );


    mostrarMensajeAdmin(
        "mensajeMaterialAcademico",
        ""
    );


    // ========================================================
    // VALIDACIONES
    // ========================================================

    if (!titulo) {

        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            "Escribe el título del material."
        );

        return;

    }


    if (!url) {

        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            "Escribe el enlace del material."
        );

        return;

    }


    if (
        ![
            "drive",
            "video",
            "enlace"
        ].includes(tipo)
    ) {

        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            "El tipo de material no es válido."
        );

        return;

    }


    if (
        !esUrlMaterialValida(url)
    ) {

        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            "Escribe un enlace válido que comience con http:// o https://"
        );

        return;

    }


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "GUARDANDO...";

    }


    try {

        // ====================================================
        // EDITAR MATERIAL
        // ====================================================

        if (id) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "material_estudiantes"
                    )
                    .update({

                        titulo:
                            titulo,

                        descripcion:
                            descripcion || null,

                        tipo:
                            tipo,

                        url:
                            url,

                        orden:
                            orden,

                        activo:
                            activo

                    })
                    .eq(
                        "id",
                        Number(id)
                    );


            if (error) {
                throw error;
            }

        }

        // ====================================================
        // CREAR MATERIAL
        // ====================================================

        else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "material_estudiantes"
                    )
                    .insert({

                        seccion_id:
                            seccionActual.id,

                        titulo:
                            titulo,

                        descripcion:
                            descripcion || null,

                        tipo:
                            tipo,

                        url:
                            url,

                        orden:
                            orden,

                        activo:
                            true

                    });


            if (error) {
                throw error;
            }

        }


        cerrarFormularioMaterial();


        await cargarContenidoMateria();

    }
    catch (error) {

        console.error(
            "Error guardando material:",
            error
        );


        mostrarMensajeAdmin(
            "mensajeMaterialAcademico",
            obtenerMensajeError(error)
        );

    }
    finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "GUARDAR";

        }

    }

}


// ============================================================
// CERRAR FORMULARIO MATERIAL
// ============================================================

function cerrarFormularioMaterial() {

    document
        .getElementById(
            "formularioMaterial"
        )
        ?.classList.add(
            "oculto"
        );


    document
        .getElementById(
            "formMaterialAcademico"
        )
        ?.reset();


    const materialId =
        document.getElementById(
            "materialId"
        );


    if (materialId) {
        materialId.value = "";
    }


    const tipo =
        document.getElementById(
            "tipoMaterial"
        );


    if (tipo) {
        tipo.value = "drive";
    }


    const orden =
        document.getElementById(
            "ordenMaterial"
        );


    if (orden) {
        orden.value = "0";
    }


    document
        .getElementById(
            "contenedorMaterialActivo"
        )
        ?.classList.add(
            "oculto"
        );


    mostrarMensajeAdmin(
        "mensajeMaterialAcademico",
        ""
    );

}


// ============================================================
// VALIDAR URL
// ============================================================

function esUrlMaterialValida(url) {

    try {

        const enlace =
            new URL(url);


        return (
            enlace.protocol === "http:"
            ||
            enlace.protocol === "https:"
        );

    }
    catch {

        return false;

    }

}


// ============================================================
// NORMALIZAR ENLACE DE GOOGLE DRIVE
// ============================================================

function obtenerEnlaceDriveVisualizacion(url) {

    if (!url) {
        return "";
    }


    try {

        const enlace =
            new URL(url);


        if (
            !enlace.hostname.includes(
                "drive.google.com"
            )
        ) {

            return url;

        }


        // Ejemplo:
        // drive.google.com/file/d/ID/view

        const coincidencia =
            enlace.pathname.match(
                /\/file\/d\/([^/]+)/
            );


        if (coincidencia?.[1]) {

            return (
                "https://drive.google.com/file/d/"
                +
                coincidencia[1]
                +
                "/preview"
            );

        }


        return url;

    }
    catch {

        return url;

    }

}


// ============================================================
// IDENTIFICAR VIDEO DE YOUTUBE
// ============================================================

function obtenerIdYoutube(url) {

    if (!url) {
        return null;
    }


    try {

        const enlace =
            new URL(url);


        // youtube.com/watch?v=XXXXXXXX

        if (
            enlace.hostname.includes(
                "youtube.com"
            )
        ) {

            const id =
                enlace.searchParams.get(
                    "v"
                );


            if (id) {
                return id;
            }


            // youtube.com/embed/XXXXXXXX

            const embed =
                enlace.pathname.match(
                    /\/embed\/([^/?]+)/
                );


            if (embed?.[1]) {
                return embed[1];
            }


            // youtube.com/shorts/XXXXXXXX

            const shorts =
                enlace.pathname.match(
                    /\/shorts\/([^/?]+)/
                );


            if (shorts?.[1]) {
                return shorts[1];
            }

        }


        // youtu.be/XXXXXXXX

        if (
            enlace.hostname ===
            "youtu.be"
        ) {

            return enlace.pathname
                .replace("/", "")
                .split("/")[0]
                || null;

        }


        return null;

    }
    catch {

        return null;

    }

}


// ============================================================
// OBTENER URL EMBEBIDA DE VIDEO
// ============================================================

function obtenerUrlVideoEmbebido(url) {

    const youtubeId =
        obtenerIdYoutube(url);


    if (youtubeId) {

        return (
            "https://www.youtube.com/embed/"
            +
            encodeURIComponent(
                youtubeId
            )
        );

    }


    // Si no es YouTube,
    // conservamos el enlace original.

    return url || "";

}


// ============================================================
// ACTUALIZAR AYUDA SEGÚN TIPO DE MATERIAL
// ============================================================

function actualizarAyudaTipoMaterial() {

    const tipo =
        document.getElementById(
            "tipoMaterial"
        )?.value;


    const url =
        document.getElementById(
            "urlMaterial"
        );


    if (!url) {
        return;
    }


    switch (tipo) {

        case "drive":

            url.placeholder =
                "https://drive.google.com/file/d/.../view";

            break;


        case "video":

            url.placeholder =
                "https://www.youtube.com/watch?v=...";

            break;


        case "enlace":

            url.placeholder =
                "https://...";

            break;


        default:

            url.placeholder =
                "https://...";

    }

}
// ============================================================
// CARGAR OBSERVACIONES
// ============================================================

async function cargarObservacionesAdmin() {

    const contenedor =
        document.getElementById(
            "listaObservacionesAdmin"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `

        <p class="estado-carga">
            Cargando observaciones...
        </p>

    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "obtener_observaciones_material_admin"
            );


        if (error) {
            throw error;
        }


        observacionesAdmin =
            data || [];


        actualizarResumenObservacionesAdmin();

        renderizarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error cargando observaciones:",
            error
        );


        contenedor.innerHTML = `

            <p class="mensaje error">
                No se pudieron cargar las observaciones.
            </p>

        `;

    }

}


// ============================================================
// RESUMEN DE OBSERVACIONES
// ============================================================

function actualizarResumenObservacionesAdmin() {

    const total =
        observacionesAdmin.length;


    const pendientes =
        observacionesAdmin.filter(
            observacion =>
                observacion.estado ===
                "pendiente"
        ).length;


    const atendidas =
        observacionesAdmin.filter(
            observacion =>
                observacion.estado ===
                "atendida"
        ).length;


    const totalElemento =
        document.getElementById(
            "totalObservacionesAdmin"
        );


    const pendientesElemento =
        document.getElementById(
            "totalPendientesAdmin"
        );


    const atendidasElemento =
        document.getElementById(
            "totalAtendidasAdmin"
        );


    if (totalElemento) {
        totalElemento.textContent =
            total;
    }


    if (pendientesElemento) {
        pendientesElemento.textContent =
            pendientes;
    }


    if (atendidasElemento) {
        atendidasElemento.textContent =
            atendidas;
    }

}


// ============================================================
// MOSTRAR OBSERVACIONES
// ============================================================

function renderizarObservacionesAdmin() {

    const contenedor =
        document.getElementById(
            "listaObservacionesAdmin"
        );


    if (!contenedor) {
        return;
    }


    let lista =
        [...observacionesAdmin];


    if (
        filtroObservacionesAdmin !==
        "todas"
    ) {

        lista =
            lista.filter(
                observacion =>
                    observacion.estado ===
                    filtroObservacionesAdmin
            );

    }


    // Más recientes primero.

    lista.sort(
        (a, b) =>
            new Date(
                b.created_at || 0
            )
            -
            new Date(
                a.created_at || 0
            )
    );


    if (!lista.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <span>
                    💬
                </span>

                <strong>
                    No hay observaciones
                </strong>

                <p>
                    No existen observaciones
                    para este filtro.
                </p>

            </div>

        `;


        return;

    }


    contenedor.innerHTML =
        lista
            .map(
                observacion =>
                    crearTarjetaObservacionAdmin(
                        observacion
                    )
            )
            .join("");

}


// ============================================================
// CREAR TARJETA DE OBSERVACIÓN
// ============================================================

function crearTarjetaObservacionAdmin(
    observacion
) {

    const id =
        Number(
            observacion.id
        );


    const estado =
        observacion.estado ===
        "atendida"
            ? "atendida"
            : "pendiente";


    const nombre =
        observacion.nombre
        ||
        observacion.nombre_origen
        ||
        observacion.usuario_nombre
        ||
        observacion.estudiante_nombre
        ||
        "Usuario";


    const codigo =
        observacion.codigo_ceta
        ||
        observacion.codigo
        ||
        "";


    const grupo =
        observacion.grupo
        ||
        observacion.codigo_grupo
        ||
        "";


    const tipo =
        nombreTipoObservacionAdmin(
            observacion.tipo
        );


    const fecha =
        formatearFechaObservacionAdmin(
            observacion.created_at
        );


    const respuesta =
        observacion.respuesta_admin
        || "";


    return `

        <article
            class="observacion-admin-card ${estado}"
        >

            <div
                class="observacion-admin-cabecera"
            >

                <div>

                    <strong>

                        ${escaparHTML(
                            nombre
                        )}

                    </strong>


                    ${
                        codigo

                            ? `

                                <span>
                                    ${escaparHTML(codigo)}
                                </span>

                            `

                            : ""
                    }


                    ${
                        grupo

                            ? `

                                <span>
                                    Grupo:
                                    ${escaparHTML(grupo)}
                                </span>

                            `

                            : ""
                    }

                </div>


                <span
                    class="estado-badge ${estado}"
                >

                    ${
                        estado === "atendida"
                            ? "Atendida"
                            : "Pendiente"
                    }

                </span>

            </div>


            <div
                class="observacion-admin-meta"
            >

                <span>
                    ${escaparHTML(tipo)}
                </span>

                <span>
                    ${escaparHTML(fecha)}
                </span>

            </div>


            <div
                class="observacion-admin-texto"
            >

                ${escaparHTML(
                    observacion.observacion
                    || ""
                )}

            </div>


            <div
                class="observacion-admin-respuesta"
            >

                <label
                    for="respuestaObservacion${id}"
                >
                    Respuesta del administrador
                </label>


                <textarea
                    id="respuestaObservacion${id}"
                    rows="3"
                    maxlength="1500"
                    placeholder="Escribe una respuesta..."
                >${escaparHTML(respuesta)}</textarea>

            </div>


            <div
                class="observacion-admin-acciones"
            >

                <button
                    type="button"
                    class="btn-secundario"
                    onclick="guardarRespuestaObservacionAdmin(${id})"
                >
                    GUARDAR RESPUESTA
                </button>


                ${
                    estado === "pendiente"

                        ? `

                            <button
                                type="button"
                                class="btn-primario"
                                onclick="marcarObservacionAtendida(${id})"
                            >
                                MARCAR ATENDIDA
                            </button>

                        `

                        : `

                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="reabrirObservacionAdmin(${id})"
                            >
                                MARCAR PENDIENTE
                            </button>

                        `
                }


                <button
                    type="button"
                    class="btn-peligro"
                    onclick="eliminarObservacionAdmin(${id})"
                >
                    ELIMINAR
                </button>

            </div>

        </article>

    `;

}


// ============================================================
// NOMBRE DEL TIPO DE OBSERVACIÓN
// ============================================================

function nombreTipoObservacionAdmin(tipo) {

    switch (tipo) {

        case "sugerencia":
            return "Sugerencia";

        case "problema_material":
            return "Problema con material";

        case "enlace_caido":
            return "Enlace caído";

        case "otro":
            return "Otro";

        default:
            return "Observación";

    }

}


// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFechaObservacionAdmin(
    fecha
) {

    if (!fecha) {
        return "";
    }


    try {

        return new Intl.DateTimeFormat(
            "es-BO",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(
            new Date(fecha)
        );

    }
    catch {

        return String(fecha);

    }

}


// ============================================================
// ACTUALIZAR OBSERVACIÓN
// ============================================================

async function actualizarObservacionAdmin(
    id,
    estado,
    respuesta
) {

    const {
        error
    } =
        await supabaseClient.rpc(
            "actualizar_observacion_material_admin",
            {
                p_observacion_id:
                    Number(id),

                p_estado:
                    estado,

                p_respuesta_admin:
                    respuesta || null
            }
        );


    if (error) {
        throw error;
    }

}


// ============================================================
// MARCAR COMO ATENDIDA
// ============================================================

async function marcarObservacionAtendida(
    id
) {

    const textarea =
        document.getElementById(
            `respuestaObservacion${id}`
        );


    const respuesta =
        textarea?.value
            ?.trim()
        || "";


    try {

        await actualizarObservacionAdmin(
            id,
            "atendida",
            respuesta
        );


        await cargarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error actualizando observación:",
            error
        );


        alert(
            obtenerMensajeError(error)
        );

    }

}


// ============================================================
// REABRIR OBSERVACIÓN
// ============================================================

async function reabrirObservacionAdmin(
    id
) {

    const textarea =
        document.getElementById(
            `respuestaObservacion${id}`
        );


    const respuesta =
        textarea?.value
            ?.trim()
        || "";


    try {

        await actualizarObservacionAdmin(
            id,
            "pendiente",
            respuesta
        );


        await cargarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error reabriendo observación:",
            error
        );


        alert(
            obtenerMensajeError(error)
        );

    }

}


// ============================================================
// GUARDAR RESPUESTA
// ============================================================

async function guardarRespuestaObservacionAdmin(
    id
) {

    const observacion =
        observacionesAdmin.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!observacion) {
        return;
    }


    const textarea =
        document.getElementById(
            `respuestaObservacion${id}`
        );


    const respuesta =
        textarea?.value
            ?.trim()
        || "";


    try {

        await actualizarObservacionAdmin(
            id,
            observacion.estado ||
                "pendiente",
            respuesta
        );


        await cargarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error guardando respuesta:",
            error
        );


        alert(
            obtenerMensajeError(error)
        );

    }

}


// ============================================================
// ELIMINAR OBSERVACIÓN
// ============================================================

async function eliminarObservacionAdmin(
    id
) {

    const confirmar =
        window.confirm(
            "¿Deseas eliminar esta observación?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient.rpc(
                "eliminar_observacion_material_admin",
                {
                    p_observacion_id:
                        Number(id)
                }
            );


        if (error) {
            throw error;
        }


        await cargarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error eliminando observación:",
            error
        );


        alert(
            obtenerMensajeError(error)
        );

    }

}


// ============================================================
// FILTRO DE OBSERVACIONES
// ============================================================

function cambiarFiltroObservacionesAdmin(
    filtro
) {

    filtroObservacionesAdmin =
        filtro;


    document
        .querySelectorAll(
            ".filtro-observacion"
        )
        .forEach(
            boton => {

                boton.classList.toggle(
                    "activo",
                    boton.dataset.filtro ===
                        filtro
                );

            }
        );


    renderizarObservacionesAdmin();

}


// ============================================================
// MENSAJES
// ============================================================

function mostrarMensajeAdmin(
    elementoId,
    texto,
    tipo = "error"
) {

    const elemento =
        document.getElementById(
            elementoId
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        texto;


    elemento.classList.remove(
        "error",
        "exito"
    );


    if (texto) {

        elemento.classList.add(
            tipo
        );

    }

}


// ============================================================
// MENSAJES DE SUPABASE
// ============================================================

function obtenerMensajeError(error) {

    const mensaje =
        error?.message
        ||
        error?.details
        ||
        "Ocurrió un error inesperado.";


    if (
        mensaje.includes(
            "Ya existe un grupo"
        )
    ) {

        return "Ya existe un grupo con ese código.";

    }


    if (
        mensaje.includes(
            "Ya existe un estudiante"
        )
    ) {

        return "Ese código CETA ya está registrado.";

    }


    if (
        mensaje
            .toLowerCase()
            .includes(
                "duplicate"
            )
    ) {

        return "Ya existe un registro con esos datos.";

    }


    if (
        mensaje.includes(
            "No autorizado"
        )
        ||
        mensaje
            .toLowerCase()
            .includes(
                "permission"
            )
    ) {

        return "No tienes autorización para realizar esta acción.";

    }


    return mensaje;

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


// ============================================================
// INSTALAR TEMA CETA
// ============================================================

function instalarTemaCeta() {

    // --------------------------------------------------------
    // CARGAR CSS DEL TEMA SI TODAVÍA NO ESTÁ CARGADO
    // --------------------------------------------------------

    if (
        !document.getElementById(
            "temaCetaCss"
        )
    ) {

        const link =
            document.createElement(
                "link"
            );


        link.id =
            "temaCetaCss";


        link.rel =
            "stylesheet";


        link.href =
            "css/tema-ceta.css";


        document.head.appendChild(
            link
        );

    }


    // --------------------------------------------------------
    // RECUPERAR TEMA GUARDADO
    // --------------------------------------------------------

    const temaGuardado =
        localStorage.getItem(
            "ceta_tema"
        )
        ||
        "claro";


    aplicarTemaAdministrador(
        temaGuardado
    );


    // --------------------------------------------------------
    // CREAR BOTÓN DE TEMA
    // --------------------------------------------------------

    if (
        !document.getElementById(
            "btnTemaAdmin"
        )
    ) {

        const boton =
            document.createElement(
                "button"
            );


        boton.type =
            "button";


        boton.id =
            "btnTemaAdmin";


        boton.className =
            "btn-tema-ceta";


        boton.setAttribute(
            "aria-label",
            "Cambiar tema"
        );


        boton.addEventListener(
            "click",
            () => {

                const actual =
                    document.documentElement
                        .dataset.tema
                    ||
                    "claro";


                const nuevo =
                    actual === "oscuro"
                        ? "claro"
                        : "oscuro";


                aplicarTemaAdministrador(
                    nuevo
                );


                localStorage.setItem(
                    "ceta_tema",
                    nuevo
                );

            }
        );


        const cerrarSesion =
            document.getElementById(
                "btnCerrarSesion"
            );


        if (
            cerrarSesion
            &&
            cerrarSesion.parentElement
        ) {

            cerrarSesion.parentElement
                .insertBefore(
                    boton,
                    cerrarSesion
                );

        }
        else {

            boton.classList.add(
                "btn-tema-flotante"
            );


            document.body.appendChild(
                boton
            );

        }

    }


    actualizarTextoBotonTemaAdministrador();

}


// ============================================================
// APLICAR TEMA
// ============================================================

function aplicarTemaAdministrador(
    tema
) {

    const temaFinal =
        tema === "oscuro"
            ? "oscuro"
            : "claro";


    document.documentElement
        .dataset.tema =
        temaFinal;


    document.body
        ?.classList.toggle(
            "tema-oscuro",
            temaFinal === "oscuro"
        );


    document.body
        ?.classList.toggle(
            "tema-claro",
            temaFinal === "claro"
        );


    actualizarTextoBotonTemaAdministrador();

}


// ============================================================
// ACTUALIZAR BOTÓN DE TEMA
// ============================================================

function actualizarTextoBotonTemaAdministrador() {

    const boton =
        document.getElementById(
            "btnTemaAdmin"
        );


    if (!boton) {
        return;
    }


    const oscuro =
        document.documentElement
            .dataset.tema ===
        "oscuro";


    boton.innerHTML =
        oscuro
            ? "☀️ Modo claro"
            : "🌙 Modo oscuro";


    boton.title =
        oscuro
            ? "Cambiar a modo claro"
            : "Cambiar a modo oscuro";

}

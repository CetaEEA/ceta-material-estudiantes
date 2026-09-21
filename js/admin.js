// ============================================================
// CETA - MATERIAL ACADÉMICO
// PANEL ADMINISTRADOR
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

let observacionesAdmin = [];

let filtroObservacionesAdmin =
    "todas";


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPanelAdministrador
);


async function iniciarPanelAdministrador() {

    instalarTemaCeta();

    registrarEventos();

    const autorizado =
        await protegerPanelAdministrador();


    if (!autorizado) {
        return;
    }


    await Promise.all([
        cargarEstadisticas(),
        cargarGrupos(),
        cargarMaterias()
    ]);

}


// ============================================================
// PROTECCIÓN DEL PANEL
// ============================================================

async function protegerPanelAdministrador() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error || !data?.session?.user) {

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
                .from("perfiles")
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


        document.getElementById(
            "nombreAdministrador"
        ).textContent =
            perfil.nombre ||
            perfil.usuario ||
            "Administrador";


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
// EVENTOS
// ============================================================

function registrarEventos() {

    document
        .getElementById("btnCerrarSesion")
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
    // PROMOCIÓN DE GRUPOS
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
    // MATERIAL ACADÉMICO
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
// NAVEGACIÓN
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


    // Cuando se abre Observaciones,
    // se actualiza automáticamente la lista.

    if (nombre === "observaciones") {

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
                        "activo",
                        true
                    )
                    .eq(
                        "estado",
                        "estudiante"
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
                        "activo",
                        true
                    )
                    .eq(
                        "estado",
                        "egresado"
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
                    .eq(
                        "activo",
                        true
                    )

            ]);


        const totalEstudiantes =
            estudiantes.count || 0;


        const totalGrupos =
            gruposResultado.count || 0;


        const totalEgresados =
            egresados.count || 0;


        const totalMaterias =
            materias.count || 0;


        const elementoEstudiantes =
            document.getElementById(
                "totalEstudiantes"
            );


        const elementoGrupos =
            document.getElementById(
                "totalGrupos"
            );


        const elementoEgresados =
            document.getElementById(
                "totalEgresados"
            );


        const elementoMaterias =
            document.getElementById(
                "totalMaterias"
            );


        if (elementoEstudiantes) {

            elementoEstudiantes.textContent =
                totalEstudiantes;

        }


        if (elementoGrupos) {

            elementoGrupos.textContent =
                totalGrupos;

        }


        if (elementoEgresados) {

            elementoEgresados.textContent =
                totalEgresados;

        }


        if (elementoMaterias) {

            elementoMaterias.textContent =
                totalMaterias;

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
// GRUPOS
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
        <div class="vacio">
            Cargando grupos...
        </div>
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
            <div class="vacio">
                Error al cargar los grupos.
            </div>
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

                <strong>
                    No existen grupos.
                </strong>

                <p>
                    Cree el primer grupo de estudiantes.
                </p>

            </div>
        `;

        return;

    }


    contenedor.innerHTML =
        grupos
            .map(
                grupo => {

                    const seleccionado =
                        grupoSeleccionado
                        &&
                        Number(
                            grupoSeleccionado.id
                        )
                        ===
                        Number(
                            grupo.id
                        );


                    return `

                        <article
                            class="grupo-card ${
                                seleccionado
                                    ? "seleccionado"
                                    : ""
                            }"
                        >

                            <div
                                class="grupo-card-info"
                                onclick="seleccionarGrupo(${grupo.id})"
                            >

                                <strong>
                                    ${escaparHTML(
                                        grupo.codigo_grupo
                                    )}
                                </strong>

                                <span>
                                    ${grupo.semestre}° semestre
                                </span>

                                <span
                                    class="${
                                        grupo.activo
                                            ? "badge-activo"
                                            : "badge-inactivo"
                                    }"
                                >
                                    ${
                                        grupo.activo
                                            ? "Activo"
                                            : "Inactivo"
                                    }
                                </span>

                            </div>


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

    document.getElementById(
        "grupoId"
    ).value =
        "";


    document.getElementById(
        "grupoCodigo"
    ).value =
        "";


    document.getElementById(
        "grupoSemestre"
    ).value =
        "1";


    document.getElementById(
        "grupoActivo"
    ).checked =
        true;


    document.getElementById(
        "grupoActivoWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormGrupo"
    ).textContent =
        "Nuevo grupo";


    document.getElementById(
        "mensajeGrupo"
    ).textContent =
        "";


    document.getElementById(
        "formGrupoWrap"
    ).classList.remove(
        "oculto"
    );

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


    document.getElementById(
        "grupoId"
    ).value =
        grupo.id;


    document.getElementById(
        "grupoCodigo"
    ).value =
        grupo.codigo_grupo;


    document.getElementById(
        "grupoSemestre"
    ).value =
        grupo.semestre;


    document.getElementById(
        "grupoActivo"
    ).checked =
        grupo.activo;


    document.getElementById(
        "grupoActivoWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormGrupo"
    ).textContent =
        "Editar grupo";


    document.getElementById(
        "mensajeGrupo"
    ).textContent =
        "";


    document.getElementById(
        "formGrupoWrap"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR FORMULARIO GRUPO
// ============================================================

function cerrarFormularioGrupo() {

    document.getElementById(
        "formGrupoWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "formGrupo"
    )?.reset();


    document.getElementById(
        "mensajeGrupo"
    ).textContent =
        "";

}


// ============================================================
// GUARDAR GRUPO
// ============================================================

async function guardarGrupo(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "grupoId"
        ).value;


    const codigo =
        document.getElementById(
            "grupoCodigo"
        ).value
            .trim()
            .toUpperCase();


    const semestre =
        Number(
            document.getElementById(
                "grupoSemestre"
            ).value
        );


    const activo =
        document.getElementById(
            "grupoActivo"
        ).checked;


    const mensaje =
        document.getElementById(
            "mensajeGrupo"
        );


    if (!codigo) {

        mensaje.textContent =
            "Ingrese el código del grupo.";

        mensaje.className =
            "mensaje error";

        return;

    }


    mensaje.textContent =
        "Guardando...";

    mensaje.className =
        "mensaje";


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


        mensaje.textContent =
            id
                ? "Grupo actualizado correctamente."
                : "Grupo creado correctamente.";


        mensaje.className =
            "mensaje exito";


        await cargarGrupos();

        await cargarEstadisticas();


        setTimeout(
            cerrarFormularioGrupo,
            700
        );

    }
    catch (error) {

        console.error(
            "Error guardando grupo:",
            error
        );


        mensaje.textContent =
            error?.message ||
            "No fue posible guardar el grupo.";


        mensaje.className =
            "mensaje error";

    }

}
// ============================================================
// SELECCIONAR GRUPO
// ============================================================

async function seleccionarGrupo(id) {

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


    grupoSeleccionado =
        grupo;


    renderizarGrupos();


    document.getElementById(
        "grupoSeleccionadoPanel"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "grupoSeleccionadoTitulo"
    ).textContent =
        grupo.codigo_grupo;


    document.getElementById(
        "grupoSeleccionadoSemestre"
    ).textContent =
        `${grupo.semestre}° semestre`;


    cerrarFormularioEstudiante();

    cerrarImportacionExcel();

    cerrarPromocion();


    await cargarEstudiantesGrupo();

}


// ============================================================
// CARGAR ESTUDIANTES DEL GRUPO
// ============================================================

async function cargarEstudiantesGrupo() {

    if (!grupoSeleccionado) {
        return;
    }


    const cuerpo =
        document.getElementById(
            "tablaEstudiantesBody"
        );


    if (cuerpo) {

        cuerpo.innerHTML = `

            <tr>

                <td colspan="4">
                    Cargando estudiantes...
                </td>

            </tr>

        `;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "estudiantes_ceta"
                )
                .select(
                    "id, codigo_ceta, nombre, grupo_id, estado, activo, created_at"
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


        if (cuerpo) {

            cuerpo.innerHTML = `

                <tr>

                    <td colspan="4">
                        No fue posible cargar los estudiantes.
                    </td>

                </tr>

            `;

        }

    }

}


// ============================================================
// RENDERIZAR ESTUDIANTES
// ============================================================

function renderizarEstudiantes() {

    const cuerpo =
        document.getElementById(
            "tablaEstudiantesBody"
        );


    if (!cuerpo) {
        return;
    }


    const busqueda =
        document.getElementById(
            "buscarEstudiante"
        )?.value
            .trim()
            .toLowerCase()
        || "";


    let lista =
        [...estudiantesGrupo];


    if (busqueda) {

        lista =
            lista.filter(
                estudiante => {

                    const codigo =
                        String(
                            estudiante.codigo_ceta || ""
                        ).toLowerCase();


                    const nombre =
                        String(
                            estudiante.nombre || ""
                        ).toLowerCase();


                    return (
                        codigo.includes(
                            busqueda
                        )
                        ||
                        nombre.includes(
                            busqueda
                        )
                    );

                }
            );

    }


    if (!lista.length) {

        cuerpo.innerHTML = `

            <tr>

                <td colspan="4">

                    ${
                        busqueda
                            ? "No se encontraron estudiantes."
                            : "Este grupo todavía no tiene estudiantes."
                    }

                </td>

            </tr>

        `;


        return;

    }


    cuerpo.innerHTML =
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
                                class="${
                                    estudiante.activo
                                        ? "badge-activo"
                                        : "badge-inactivo"
                                }"
                            >

                                ${
                                    estudiante.activo
                                        ? "Activo"
                                        : "Inactivo"
                                }

                            </span>

                        </td>


                        <td>

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
            .join("");

}


// ============================================================
// PREPARAR NUEVO ESTUDIANTE
// ============================================================

function prepararNuevoEstudiante() {

    if (!grupoSeleccionado) {

        alert(
            "Primero selecciona un grupo."
        );

        return;

    }


    document.getElementById(
        "estudianteId"
    ).value =
        "";


    document.getElementById(
        "estudianteCodigo"
    ).value =
        "";


    document.getElementById(
        "estudianteNombre"
    ).value =
        "";


    document.getElementById(
        "estudianteActivo"
    ).checked =
        true;


    document.getElementById(
        "estudianteActivoWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormEstudiante"
    ).textContent =
        "Nuevo estudiante";


    document.getElementById(
        "mensajeEstudiante"
    ).textContent =
        "";


    document.getElementById(
        "formEstudianteWrap"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "estudianteCodigo"
    )?.focus();

}


// ============================================================
// EDITAR ESTUDIANTE
// ============================================================

function editarEstudiante(id) {

    const estudiante =
        estudiantesGrupo.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (!estudiante) {
        return;
    }


    document.getElementById(
        "estudianteId"
    ).value =
        estudiante.id;


    document.getElementById(
        "estudianteCodigo"
    ).value =
        estudiante.codigo_ceta;


    document.getElementById(
        "estudianteNombre"
    ).value =
        estudiante.nombre;


    document.getElementById(
        "estudianteActivo"
    ).checked =
        estudiante.activo;


    document.getElementById(
        "estudianteActivoWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormEstudiante"
    ).textContent =
        "Editar estudiante";


    document.getElementById(
        "mensajeEstudiante"
    ).textContent =
        "";


    document.getElementById(
        "formEstudianteWrap"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR FORMULARIO ESTUDIANTE
// ============================================================

function cerrarFormularioEstudiante() {

    document.getElementById(
        "formEstudianteWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "formEstudianteAdmin"
    )?.reset();


    const mensaje =
        document.getElementById(
            "mensajeEstudiante"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }

}


// ============================================================
// GUARDAR ESTUDIANTE
// ============================================================

async function guardarEstudiante(event) {

    event.preventDefault();


    if (!grupoSeleccionado) {

        alert(
            "No existe un grupo seleccionado."
        );

        return;

    }


    const id =
        document.getElementById(
            "estudianteId"
        ).value;


    const codigo =
        document.getElementById(
            "estudianteCodigo"
        ).value.trim();


    const nombre =
        document.getElementById(
            "estudianteNombre"
        ).value.trim();


    const activo =
        document.getElementById(
            "estudianteActivo"
        ).checked;


    const mensaje =
        document.getElementById(
            "mensajeEstudiante"
        );


    if (!codigo || !nombre) {

        mensaje.textContent =
            "Completa el código CETA y el nombre.";


        mensaje.className =
            "mensaje error";


        return;

    }


    mensaje.textContent =
        "Guardando...";


    mensaje.className =
        "mensaje";


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
                            Number(
                                grupoSeleccionado.id
                            ),

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
                            Number(
                                grupoSeleccionado.id
                            )
                    }
                );

        }


        if (resultado.error) {

            throw resultado.error;

        }


        mensaje.textContent =
            id
                ? "Estudiante actualizado correctamente."
                : "Estudiante creado correctamente.";


        mensaje.className =
            "mensaje exito";


        await cargarEstudiantesGrupo();

        await cargarEstadisticas();


        setTimeout(
            cerrarFormularioEstudiante,
            700
        );

    }
    catch (error) {

        console.error(
            "Error guardando estudiante:",
            error
        );


        mensaje.textContent =
            error?.message ||
            "No fue posible guardar el estudiante.";


        mensaje.className =
            "mensaje error";

    }

}


// ============================================================
// IMPORTACIÓN DE EXCEL
// ============================================================

function abrirImportacionExcel() {

    if (!grupoSeleccionado) {

        alert(
            "Primero selecciona un grupo."
        );

        return;

    }


    estudiantesExcel =
        [];


    const archivo =
        document.getElementById(
            "archivoExcel"
        );


    if (archivo) {

        archivo.value =
            "";

    }


    const vistaPrevia =
        document.getElementById(
            "vistaPreviaExcel"
        );


    if (vistaPrevia) {

        vistaPrevia.innerHTML = `

            <div class="vacio">

                Selecciona un archivo Excel.

            </div>

        `;

    }


    const contador =
        document.getElementById(
            "cantidadExcel"
        );


    if (contador) {

        contador.textContent =
            "0";

    }


    const mensaje =
        document.getElementById(
            "mensajeExcel"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }


    document.getElementById(
        "panelImportarExcel"
    )?.classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR IMPORTACIÓN
// ============================================================

function cerrarImportacionExcel() {

    estudiantesExcel =
        [];


    document.getElementById(
        "panelImportarExcel"
    )?.classList.add(
        "oculto"
    );


    const archivo =
        document.getElementById(
            "archivoExcel"
        );


    if (archivo) {

        archivo.value =
            "";

    }

}


// ============================================================
// NORMALIZAR ENCABEZADO EXCEL
// ============================================================

function normalizarEncabezado(texto) {

    return String(
        texto ?? ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        );

}


// ============================================================
// DETECTAR COLUMNAS DEL EXCEL
// ============================================================

function detectarColumnasExcel(fila) {

    if (
        !fila
        ||
        typeof fila !== "object"
    ) {

        return null;

    }


    const columnas =
        Object.keys(
            fila
        );


    const aliasNombre =
        [
            "nombre",
            "nombres",
            "nombrecompleto",
            "estudiante",
            "alumno",
            "alumnos"
        ];


    const aliasCodigo =
        [
            "codigo",
            "codigoceta",
            "codceta",
            "codigoestudiante",
            "cod"
        ];


    let columnaNombre =
        null;


    let columnaCodigo =
        null;


    columnas.forEach(
        columna => {

            const normalizada =
                normalizarEncabezado(
                    columna
                );


            if (
                !columnaNombre
                &&
                aliasNombre.includes(
                    normalizada
                )
            ) {

                columnaNombre =
                    columna;

            }


            if (
                !columnaCodigo
                &&
                aliasCodigo.includes(
                    normalizada
                )
            ) {

                columnaCodigo =
                    columna;

            }

        }
    );


    if (
        !columnaNombre
        ||
        !columnaCodigo
    ) {

        return null;

    }


    return {
        nombre:
            columnaNombre,

        codigo:
            columnaCodigo
    };

}


// ============================================================
// LEER ARCHIVO EXCEL
// ============================================================

async function leerArchivoExcel(event) {

    const archivo =
        event.target.files?.[0];


    estudiantesExcel =
        [];


    const mensaje =
        document.getElementById(
            "mensajeExcel"
        );


    const vistaPrevia =
        document.getElementById(
            "vistaPreviaExcel"
        );


    const contador =
        document.getElementById(
            "cantidadExcel"
        );


    if (!archivo) {

        if (contador) {

            contador.textContent =
                "0";

        }


        return;

    }


    const nombreArchivo =
        archivo.name.toLowerCase();


    if (
        !nombreArchivo.endsWith(
            ".xlsx"
        )
        &&
        !nombreArchivo.endsWith(
            ".xls"
        )
    ) {

        mensaje.textContent =
            "Selecciona un archivo .xlsx o .xls.";


        mensaje.className =
            "mensaje error";


        event.target.value =
            "";


        return;

    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        mensaje.textContent =
            "No se pudo cargar el lector de archivos Excel.";


        mensaje.className =
            "mensaje error";


        return;

    }


    mensaje.textContent =
        "Leyendo archivo...";


    mensaje.className =
        "mensaje";


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


        const nombreHoja =
            libro.SheetNames[0];


        if (!nombreHoja) {

            throw new Error(
                "El archivo no contiene hojas."
            );

        }


        const hoja =
            libro.Sheets[
                nombreHoja
            ];


        const filas =
            XLSX.utils.sheet_to_json(
                hoja,
                {
                    defval: ""
                }
            );


        if (!filas.length) {

            throw new Error(
                "La hoja de Excel está vacía."
            );

        }


        const columnas =
            detectarColumnasExcel(
                filas[0]
            );


        if (!columnas) {

            throw new Error(
                "No se encontraron las columnas de nombre y código CETA."
            );

        }


        const procesados =
            [];


        const codigos =
            new Set();


        for (
            let i = 0;
            i < filas.length;
            i++
        ) {

            const fila =
                filas[i];


            const codigo =
                String(
                    fila[
                        columnas.codigo
                    ] ?? ""
                ).trim();


            const nombre =
                String(
                    fila[
                        columnas.nombre
                    ] ?? ""
                ).trim();


            if (
                !codigo
                &&
                !nombre
            ) {

                continue;

            }


            if (
                !codigo
                ||
                !nombre
            ) {

                throw new Error(
                    `La fila ${i + 2} tiene nombre o código CETA vacío.`
                );

            }


            const codigoNormalizado =
                codigo.toLowerCase();


            if (
                codigos.has(
                    codigoNormalizado
                )
            ) {

                throw new Error(
                    `El código ${codigo} está repetido en el archivo.`
                );

            }


            codigos.add(
                codigoNormalizado
            );


            procesados.push({
                codigo_ceta:
                    codigo,

                nombre:
                    nombre
            });

        }


        if (!procesados.length) {

            throw new Error(
                "No se encontraron estudiantes válidos."
            );

        }


        estudiantesExcel =
            procesados;


        if (contador) {

            contador.textContent =
                String(
                    estudiantesExcel.length
                );

        }


        mostrarVistaPreviaExcel();


        mensaje.textContent =
            "Archivo leído correctamente.";


        mensaje.className =
            "mensaje exito";

    }
    catch (error) {

        console.error(
            "Error leyendo Excel:",
            error
        );


        estudiantesExcel =
            [];


        if (contador) {

            contador.textContent =
                "0";

        }


        if (vistaPrevia) {

            vistaPrevia.innerHTML = `

                <div class="vacio">

                    No se pudo generar
                    la vista previa.

                </div>

            `;

        }


        mensaje.textContent =
            error?.message ||
            "No fue posible leer el archivo.";


        mensaje.className =
            "mensaje error";

    }

}


// ============================================================
// VISTA PREVIA DEL EXCEL
// ============================================================

function mostrarVistaPreviaExcel() {

    const contenedor =
        document.getElementById(
            "vistaPreviaExcel"
        );


    if (!contenedor) {
        return;
    }


    if (!estudiantesExcel.length) {

        contenedor.innerHTML = `

            <div class="vacio">
                No hay datos para mostrar.
            </div>

        `;

        return;

    }


    const primeros =
        estudiantesExcel.slice(
            0,
            20
        );


    let html = `

        <div class="tabla-responsive">

            <table>

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            Código CETA
                        </th>

                        <th>
                            Nombre
                        </th>

                    </tr>

                </thead>


                <tbody>

    `;


    html +=
        primeros
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

                    </tr>

                `
            )
            .join("");


    html += `

                </tbody>

            </table>

        </div>

    `;


    if (
        estudiantesExcel.length >
        primeros.length
    ) {

        html += `

            <p class="texto-secundario">

                Se muestran los primeros
                ${primeros.length}
                de
                ${estudiantesExcel.length}
                estudiantes.

            </p>

        `;

    }


    contenedor.innerHTML =
        html;

}
// ============================================================
// CONFIRMAR IMPORTACIÓN EXCEL
// ============================================================

async function confirmarImportacionExcel() {

    if (!grupoSeleccionado) {

        alert(
            "Primero selecciona un grupo."
        );

        return;

    }


    if (!estudiantesExcel.length) {

        alert(
            "Primero selecciona y revisa un archivo Excel."
        );

        return;

    }


    const confirmar =
        window.confirm(
            `Se reemplazará la lista actual del grupo ${grupoSeleccionado.codigo_grupo} con ${estudiantesExcel.length} estudiantes.\n\nLos estudiantes que actualmente pertenecen al grupo y no aparezcan en el nuevo Excel quedarán inactivos y fuera del grupo.\n\n¿Deseas continuar?`
        );


    if (!confirmar) {
        return;
    }


    const boton =
        document.getElementById(
            "btnConfirmarExcel"
        );


    const mensaje =
        document.getElementById(
            "mensajeExcel"
        );


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "IMPORTANDO...";

    }


    if (mensaje) {

        mensaje.textContent =
            "Actualizando lista de estudiantes...";

        mensaje.className =
            "mensaje";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "reemplazar_lista_grupo_estudiantes",
                {
                    p_grupo_id:
                        Number(
                            grupoSeleccionado.id
                        ),

                    p_estudiantes:
                        estudiantesExcel
                }
            );


        if (error) {
            throw error;
        }


        const resultado =
            Array.isArray(data)
                ? data[0]
                : data;


        const procesados =
            resultado?.procesados ??
            resultado?.total_procesados ??
            estudiantesExcel.length;


        const nuevos =
            resultado?.nuevos ??
            resultado?.total_nuevos ??
            0;


        const actualizados =
            resultado?.actualizados ??
            resultado?.total_actualizados ??
            0;


        const retirados =
            resultado?.retirados ??
            resultado?.total_retirados ??
            0;


        if (mensaje) {

            mensaje.textContent =
                "Lista actualizada correctamente.";

            mensaje.className =
                "mensaje exito";

        }


        alert(
            "Importación completada.\n\n" +
            `Procesados: ${procesados}\n` +
            `Nuevos: ${nuevos}\n` +
            `Actualizados: ${actualizados}\n` +
            `Retirados de la lista anterior: ${retirados}`
        );


        await cargarEstudiantesGrupo();

        await cargarEstadisticas();


        cerrarImportacionExcel();

    }
    catch (error) {

        console.error(
            "Error importando estudiantes:",
            error
        );


        if (mensaje) {

            mensaje.textContent =
                error?.message ||
                "No fue posible importar la lista.";

            mensaje.className =
                "mensaje error";

        }

    }
    finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "CONFIRMAR IMPORTACIÓN";

        }

    }

}


// ============================================================
// PREPARAR PROMOCIÓN DE GRUPO
// ============================================================

function prepararPromocionGrupo() {

    if (!grupoSeleccionado) {

        alert(
            "Primero selecciona un grupo."
        );

        return;

    }


    grupoDestinoPromocion =
        null;


    const panel =
        document.getElementById(
            "panelPromocionGrupo"
        );


    const texto =
        document.getElementById(
            "textoPromocionGrupo"
        );


    const select =
        document.getElementById(
            "grupoDestinoPromocion"
        );


    const mensaje =
        document.getElementById(
            "mensajePromocion"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }


    if (
        Number(
            grupoSeleccionado.semestre
        ) === 6
    ) {

        if (texto) {

            texto.innerHTML = `

                Los estudiantes activos de
                <strong>
                    ${escaparHTML(
                        grupoSeleccionado.codigo_grupo
                    )}
                </strong>
                serán promovidos a
                <strong>
                    Egresados
                </strong>.

                <br><br>

                Los egresados conservarán acceso
                a todo el material académico de
                1° a 6° semestre.

            `;

        }


        if (select) {

            select.innerHTML = `

                <option value="">
                    Egresados
                </option>

            `;


            select.disabled =
                true;

        }

    }
    else {

        const siguienteSemestre =
            Number(
                grupoSeleccionado.semestre
            ) + 1;


        const destinos =
            grupos.filter(
                grupo =>
                    grupo.activo
                    &&
                    Number(
                        grupo.semestre
                    )
                    ===
                    siguienteSemestre
            );


        if (texto) {

            texto.innerHTML = `

                Selecciona el grupo de
                <strong>
                    ${siguienteSemestre}° semestre
                </strong>
                al que serán trasladados los
                estudiantes activos de

                <strong>
                    ${escaparHTML(
                        grupoSeleccionado.codigo_grupo
                    )}
                </strong>.

            `;

        }


        if (select) {

            select.disabled =
                false;


            select.innerHTML = `

                <option value="">
                    Seleccione grupo destino
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
                                </option>

                            `
                        )
                        .join("")
                }

            `;

        }


        if (!destinos.length) {

            if (mensaje) {

                mensaje.textContent =
                    `No existe un grupo activo de ${siguienteSemestre}° semestre. Primero crea el grupo destino.`;

                mensaje.className =
                    "mensaje error";

            }

        }

    }


    panel?.classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR PROMOCIÓN
// ============================================================

function cerrarPromocion() {

    grupoDestinoPromocion =
        null;


    document.getElementById(
        "panelPromocionGrupo"
    )?.classList.add(
        "oculto"
    );


    const select =
        document.getElementById(
            "grupoDestinoPromocion"
        );


    if (select) {

        select.value =
            "";

    }


    const mensaje =
        document.getElementById(
            "mensajePromocion"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }

}


// ============================================================
// CONFIRMAR PROMOCIÓN
// ============================================================

async function confirmarPromocionGrupo() {

    if (!grupoSeleccionado) {

        return;

    }


    const semestre =
        Number(
            grupoSeleccionado.semestre
        );


    const mensaje =
        document.getElementById(
            "mensajePromocion"
        );


    const boton =
        document.getElementById(
            "btnConfirmarPromocion"
        );


    let grupoDestinoId =
        null;


    if (semestre < 6) {

        grupoDestinoId =
            Number(
                document.getElementById(
                    "grupoDestinoPromocion"
                )?.value
            );


        if (!grupoDestinoId) {

            mensaje.textContent =
                "Selecciona el grupo destino.";

            mensaje.className =
                "mensaje error";

            return;

        }


        grupoDestinoPromocion =
            grupos.find(
                grupo =>
                    Number(
                        grupo.id
                    )
                    ===
                    grupoDestinoId
            );


        if (!grupoDestinoPromocion) {

            mensaje.textContent =
                "El grupo destino no es válido.";

            mensaje.className =
                "mensaje error";

            return;

        }

    }


    let textoConfirmacion;


    if (semestre === 6) {

        textoConfirmacion =
            `¿Promover a Egresados a todos los estudiantes activos del grupo ${grupoSeleccionado.codigo_grupo}?`;

    }
    else {

        textoConfirmacion =
            `¿Promover los estudiantes activos de ${grupoSeleccionado.codigo_grupo} a ${grupoDestinoPromocion.codigo_grupo}?`;

    }


    if (
        !window.confirm(
            textoConfirmacion
        )
    ) {

        return;

    }


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "PROCESANDO...";

    }


    mensaje.textContent =
        "Realizando promoción...";

    mensaje.className =
        "mensaje";


    try {

        let resultado;


        if (semestre === 6) {

            resultado =
                await supabaseClient.rpc(
                    "promover_grupo_a_egresados",
                    {
                        p_grupo_id:
                            Number(
                                grupoSeleccionado.id
                            )
                    }
                );

        }
        else {

            resultado =
                await supabaseClient.rpc(
                    "promover_grupo_estudiantes",
                    {
                        p_grupo_origen_id:
                            Number(
                                grupoSeleccionado.id
                            ),

                        p_grupo_destino_id:
                            grupoDestinoId
                    }
                );

        }


        if (resultado.error) {

            throw resultado.error;

        }


        mensaje.textContent =
            semestre === 6
                ? "Grupo promovido a egresados correctamente."
                : "Grupo promovido correctamente.";


        mensaje.className =
            "mensaje exito";


        await cargarGrupos();

        await cargarEstudiantesGrupo();

        await cargarEstadisticas();


        setTimeout(
            cerrarPromocion,
            800
        );

    }
    catch (error) {

        console.error(
            "Error promoviendo grupo:",
            error
        );


        mensaje.textContent =
            error?.message ||
            "No fue posible promover el grupo.";


        mensaje.className =
            "mensaje error";

    }
    finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "CONFIRMAR PROMOCIÓN";

        }

    }

}


// ============================================================
// MATERIAL ACADÉMICO
// SELECCIONAR SEMESTRE
// ============================================================

async function seleccionarSemestreMaterial(
    semestre
) {

    semestreMaterialActual =
        Number(
            semestre
        );


    materiaAbierta =
        null;


    seccionesMateria =
        [];


    seccionActual =
        null;


    rutaSecciones =
        [];


    materialesSeccionActual =
        [];


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
                    )
                    ===
                    semestreMaterialActual
                );

            }
        );


    volverAListaMaterias();


    await cargarMaterias();

}


// ============================================================
// CARGAR MATERIAS
// ============================================================

async function cargarMaterias() {

    const contenedor =
        document.getElementById(
            "listaMateriasAdmin"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div class="vacio">

            Cargando materias...

        </div>

    `;


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

            <div class="vacio">

                No fue posible cargar
                las materias.

            </div>

        `;

    }

}


// ============================================================
// RENDERIZAR MATERIAS
// ============================================================

function renderizarMaterias() {

    const contenedor =
        document.getElementById(
            "listaMateriasAdmin"
        );


    if (!contenedor) {

        return;

    }


    if (!materiasMaterial.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <strong>
                    No existen materias
                    para ${semestreMaterialActual}° semestre.
                </strong>

                <p>
                    Utiliza el botón Nueva materia
                    para registrar la primera.
                </p>

            </div>

        `;


        return;

    }


    contenedor.innerHTML =
        materiasMaterial
            .map(
                materia => `

                    <article
                        class="materia-card ${
                            materia.activo
                                ? ""
                                : "materia-inactiva"
                        }"
                    >

                        <div
                            class="materia-card-contenido"
                            onclick="abrirMateria(${materia.id})"
                        >

                            <div class="materia-icono">
                                📘
                            </div>


                            <div class="materia-info">

                                <strong>

                                    ${escaparHTML(
                                        materia.nombre
                                    )}

                                </strong>


                                <span>

                                    ${
                                        materia.descripcion
                                            ? escaparHTML(
                                                materia.descripcion
                                            )
                                            : `${materia.semestre}° semestre`
                                    }

                                </span>


                                <div class="materia-meta">

                                    <span>
                                        Orden:
                                        ${Number(
                                            materia.orden || 0
                                        )}
                                    </span>


                                    <span
                                        class="${
                                            materia.activo
                                                ? "badge-activo"
                                                : "badge-inactivo"
                                        }"
                                    >

                                        ${
                                            materia.activo
                                                ? "Activa"
                                                : "Inactiva"
                                        }

                                    </span>

                                </div>

                            </div>

                        </div>


                        <div class="materia-card-acciones">

                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="abrirMateria(${materia.id})"
                            >
                                Abrir
                            </button>


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

    document.getElementById(
        "materiaId"
    ).value =
        "";


    document.getElementById(
        "materiaNombre"
    ).value =
        "";


    document.getElementById(
        "materiaDescripcion"
    ).value =
        "";


    document.getElementById(
        "materiaOrden"
    ).value =
        "0";


    document.getElementById(
        "materiaActiva"
    ).checked =
        true;


    document.getElementById(
        "materiaActivaWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormMateria"
    ).textContent =
        `Nueva materia - ${semestreMaterialActual}° semestre`;


    document.getElementById(
        "mensajeMateria"
    ).textContent =
        "";


    document.getElementById(
        "formMateriaWrap"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "materiaNombre"
    )?.focus();

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


    document.getElementById(
        "materiaId"
    ).value =
        materia.id;


    document.getElementById(
        "materiaNombre"
    ).value =
        materia.nombre || "";


    document.getElementById(
        "materiaDescripcion"
    ).value =
        materia.descripcion || "";


    document.getElementById(
        "materiaOrden"
    ).value =
        Number(
            materia.orden || 0
        );


    document.getElementById(
        "materiaActiva"
    ).checked =
        Boolean(
            materia.activo
        );


    document.getElementById(
        "materiaActivaWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormMateria"
    ).textContent =
        "Editar materia";


    document.getElementById(
        "mensajeMateria"
    ).textContent =
        "";


    document.getElementById(
        "formMateriaWrap"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR FORMULARIO MATERIA
// ============================================================

function cerrarFormularioMateria() {

    document.getElementById(
        "formMateriaWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "formMateria"
    )?.reset();


    const mensaje =
        document.getElementById(
            "mensajeMateria"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }

}


// ============================================================
// GUARDAR MATERIA
// ============================================================

async function guardarMateria(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "materiaId"
        ).value;


    const nombre =
        document.getElementById(
            "materiaNombre"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "materiaDescripcion"
        ).value.trim();


    const orden =
        Number(
            document.getElementById(
                "materiaOrden"
            ).value
            || 0
        );


    const activa =
        document.getElementById(
            "materiaActiva"
        ).checked;


    const mensaje =
        document.getElementById(
            "mensajeMateria"
        );


    if (!nombre) {

        mensaje.textContent =
            "Ingrese el nombre de la materia.";


        mensaje.className =
            "mensaje error";


        return;

    }


    mensaje.textContent =
        "Guardando...";


    mensaje.className =
        "mensaje";


    try {

        let resultado;


        if (id) {

            resultado =
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

        }
        else {

            resultado =
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

        }


        if (resultado.error) {

            throw resultado.error;

        }


        mensaje.textContent =
            id
                ? "Materia actualizada correctamente."
                : "Materia creada correctamente.";


        mensaje.className =
            "mensaje exito";


        await cargarMaterias();

        await cargarEstadisticas();


        setTimeout(
            cerrarFormularioMateria,
            700
        );

    }
    catch (error) {

        console.error(
            "Error guardando materia:",
            error
        );


        mensaje.textContent =
            error?.message ||
            "No fue posible guardar la materia.";


        mensaje.className =
            "mensaje error";

    }

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


    materialesSeccionActual =
        [];


    document.getElementById(
        "panelListaMaterias"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "panelMateriaAbierta"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "materiaAbiertaNombre"
    ).textContent =
        materia.nombre;


    document.getElementById(
        "materiaAbiertaSemestre"
    ).textContent =
        `${materia.semestre}° semestre`;


    await cargarSeccionesMateria();


    actualizarBreadcrumbMaterial();

    actualizarBotonesContenidoMaterial();

    await cargarContenidoSeccionActual();

}
// ============================================================
// VOLVER A LISTA DE MATERIAS
// ============================================================

function volverAListaMaterias() {

    materiaAbierta =
        null;

    seccionesMateria =
        [];

    seccionActual =
        null;

    rutaSecciones =
        [];

    materialesSeccionActual =
        [];


    document.getElementById(
        "panelMateriaAbierta"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "panelListaMaterias"
    )?.classList.remove(
        "oculto"
    );


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();

}


// ============================================================
// CARGAR TODAS LAS SECCIONES DE LA MATERIA
// ============================================================

async function cargarSeccionesMateria() {

    if (!materiaAbierta) {

        seccionesMateria =
            [];

        return;

    }


    try {

        const {
            data,
            error
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
                    Number(
                        materiaAbierta.id
                    )
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


        seccionesMateria =
            data || [];

    }
    catch (error) {

        console.error(
            "Error cargando secciones:",
            error
        );


        seccionesMateria =
            [];


        alert(
            error?.message ||
            "No fue posible cargar las carpetas de la materia."
        );

    }

}


// ============================================================
// CARGAR CONTENIDO DE LA SECCIÓN ACTUAL
// ============================================================

async function cargarContenidoSeccionActual() {

    if (!materiaAbierta) {

        return;

    }


    const contenedor =
        document.getElementById(
            "contenidoMateriaAdmin"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div class="vacio">

            Cargando contenido...

        </div>

    `;


    try {

        // ----------------------------------------------------
        // Si estamos en la raíz de la materia,
        // solamente mostramos carpetas principales.
        // ----------------------------------------------------

        if (!seccionActual) {

            materialesSeccionActual =
                [];


            renderizarContenidoMateria();

            actualizarBreadcrumbMaterial();

            actualizarBotonesContenidoMaterial();

            return;

        }


        // ----------------------------------------------------
        // Si estamos dentro de una carpeta,
        // cargamos sus materiales.
        // ----------------------------------------------------

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "material_estudiantes"
                )
                .select(
                    "id, seccion_id, titulo, descripcion, tipo, url, orden, activo, created_at"
                )
                .eq(
                    "seccion_id",
                    Number(
                        seccionActual.id
                    )
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


        materialesSeccionActual =
            data || [];


        renderizarContenidoMateria();

        actualizarBreadcrumbMaterial();

        actualizarBotonesContenidoMaterial();

    }
    catch (error) {

        console.error(
            "Error cargando contenido:",
            error
        );


        contenedor.innerHTML = `

            <div class="vacio">

                <strong>
                    No fue posible cargar
                    el contenido.
                </strong>

                <p>
                    ${escaparHTML(
                        error?.message || ""
                    )}
                </p>

            </div>

        `;

    }

}


// ============================================================
// OBTENER SUBCARPETAS DE LA UBICACIÓN ACTUAL
// ============================================================

function obtenerSubcarpetasActuales() {

    if (!materiaAbierta) {

        return [];

    }


    // --------------------------------------------------------
    // RAÍZ DE LA MATERIA
    // --------------------------------------------------------

    if (!seccionActual) {

        return seccionesMateria.filter(
            seccion =>
                seccion.seccion_padre_id === null
                ||
                seccion.seccion_padre_id === undefined
        );

    }


    // --------------------------------------------------------
    // DENTRO DE UNA CARPETA
    // --------------------------------------------------------

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
// RENDERIZAR CONTENIDO DE LA MATERIA
// ============================================================

function renderizarContenidoMateria() {

    const contenedor =
        document.getElementById(
            "contenidoMateriaAdmin"
        );


    if (!contenedor) {

        return;

    }


    const carpetas =
        obtenerSubcarpetasActuales();


    const materiales =
        seccionActual
            ? materialesSeccionActual
            : [];


    if (
        !carpetas.length
        &&
        !materiales.length
    ) {

        contenedor.innerHTML = `

            <div class="vacio">

                <strong>
                    Esta ubicación está vacía.
                </strong>

                <p>

                    ${
                        seccionActual
                            ? "Puedes crear una subcarpeta o añadir material académico."
                            : "Crea la primera carpeta para comenzar a organizar esta materia."
                    }

                </p>

            </div>

        `;


        return;

    }


    let html =
        "";


    // ========================================================
    // CARPETAS
    // ========================================================

    if (carpetas.length) {

        html += `

            <div class="bloque-contenido-material">

                <h4>
                    Carpetas
                </h4>


                <div class="lista-carpetas-material">

        `;


        html +=
            carpetas
                .map(
                    carpeta => `

                        <article
                            class="carpeta-material-card ${
                                carpeta.activo
                                    ? ""
                                    : "elemento-inactivo"
                            }"
                        >

                            <div
                                class="carpeta-material-info"
                                onclick="abrirSeccionMaterial(${carpeta.id})"
                            >

                                <span class="carpeta-material-icono">
                                    📁
                                </span>


                                <div>

                                    <strong>

                                        ${escaparHTML(
                                            carpeta.nombre
                                        )}

                                    </strong>


                                    <span>

                                        ${
                                            carpeta.activo
                                                ? "Carpeta activa"
                                                : "Carpeta inactiva"
                                        }

                                    </span>

                                </div>

                            </div>


                            <div class="carpeta-material-acciones">

                                <button
                                    type="button"
                                    class="btn-secundario"
                                    onclick="abrirSeccionMaterial(${carpeta.id})"
                                >
                                    Abrir
                                </button>


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
                .join("");


        html += `

                </div>

            </div>

        `;

    }


    // ========================================================
    // MATERIALES
    // ========================================================

    if (materiales.length) {

        html += `

            <div class="bloque-contenido-material">

                <h4>
                    Material
                </h4>


                <div class="lista-recursos-material">

        `;


        html +=
            materiales
                .map(
                    material => {

                        const icono =
                            obtenerIconoMaterial(
                                material.tipo
                            );


                        const tipo =
                            obtenerNombreTipoMaterial(
                                material.tipo
                            );


                        return `

                            <article
                                class="recurso-material-card ${
                                    material.activo
                                        ? ""
                                        : "elemento-inactivo"
                                }"
                            >

                                <div class="recurso-material-icono">

                                    ${icono}

                                </div>


                                <div class="recurso-material-info">

                                    <strong>

                                        ${escaparHTML(
                                            material.titulo
                                        )}

                                    </strong>


                                    <span>

                                        ${escaparHTML(
                                            tipo
                                        )}

                                        ·

                                        ${
                                            material.activo
                                                ? "Activo"
                                                : "Inactivo"
                                        }

                                    </span>


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

                                </div>


                                <div class="recurso-material-acciones">

                                    <button
                                        type="button"
                                        class="btn-secundario"
                                        onclick="abrirEnlaceMaterialAdmin(${material.id})"
                                    >
                                        Abrir
                                    </button>


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
                .join("");


        html += `

                </div>

            </div>

        `;

    }


    contenedor.innerHTML =
        html;

}


// ============================================================
// ACTUALIZAR BOTONES SEGÚN UBICACIÓN
// ============================================================

function actualizarBotonesContenidoMaterial() {

    const botonMaterial =
        document.getElementById(
            "btnNuevoMaterial"
        );


    if (botonMaterial) {

        // El material solamente puede añadirse
        // dentro de una carpeta.

        botonMaterial.disabled =
            !seccionActual;


        botonMaterial.title =
            seccionActual
                ? "Añadir material a esta carpeta"
                : "Primero abre o crea una carpeta";

    }

}


// ============================================================
// PREPARAR NUEVA CARPETA
// ============================================================

function prepararNuevaCarpeta() {

    if (!materiaAbierta) {

        alert(
            "Primero abre una materia."
        );

        return;

    }


    document.getElementById(
        "carpetaId"
    ).value =
        "";


    document.getElementById(
        "carpetaNombre"
    ).value =
        "";


    document.getElementById(
        "carpetaOrden"
    ).value =
        "0";


    document.getElementById(
        "carpetaActiva"
    ).checked =
        true;


    document.getElementById(
        "carpetaActivaWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormCarpeta"
    ).textContent =
        seccionActual
            ? `Nueva subcarpeta en ${seccionActual.nombre}`
            : `Nueva carpeta en ${materiaAbierta.nombre}`;


    document.getElementById(
        "mensajeCarpeta"
    ).textContent =
        "";


    document.getElementById(
        "formCarpetaWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "carpetaNombre"
    )?.focus();

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


    document.getElementById(
        "carpetaId"
    ).value =
        carpeta.id;


    document.getElementById(
        "carpetaNombre"
    ).value =
        carpeta.nombre || "";


    document.getElementById(
        "carpetaOrden"
    ).value =
        Number(
            carpeta.orden || 0
        );


    document.getElementById(
        "carpetaActiva"
    ).checked =
        Boolean(
            carpeta.activo
        );


    document.getElementById(
        "carpetaActivaWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormCarpeta"
    ).textContent =
        "Editar carpeta";


    document.getElementById(
        "mensajeCarpeta"
    ).textContent =
        "";


    document.getElementById(
        "formCarpetaWrap"
    )?.classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR FORMULARIO CARPETA
// ============================================================

function cerrarFormularioCarpeta() {

    document.getElementById(
        "formCarpetaWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "formCarpeta"
    )?.reset();


    const mensaje =
        document.getElementById(
            "mensajeCarpeta"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }

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
        ).value;


    const nombre =
        document.getElementById(
            "carpetaNombre"
        ).value.trim();


    const orden =
        Number(
            document.getElementById(
                "carpetaOrden"
            ).value
            || 0
        );


    const activa =
        document.getElementById(
            "carpetaActiva"
        ).checked;


    const mensaje =
        document.getElementById(
            "mensajeCarpeta"
        );


    if (!nombre) {

        mensaje.textContent =
            "Ingrese el nombre de la carpeta.";


        mensaje.className =
            "mensaje error";


        return;

    }


    mensaje.textContent =
        "Guardando...";


    mensaje.className =
        "mensaje";


    try {

        let resultado;


        if (id) {

            resultado =
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

        }
        else {

            resultado =
                await supabaseClient
                    .from(
                        "secciones_material"
                    )
                    .insert({
                        materia_id:
                            Number(
                                materiaAbierta.id
                            ),

                        seccion_padre_id:
                            seccionActual
                                ? Number(
                                    seccionActual.id
                                )
                                : null,

                        nombre:
                            nombre,

                        orden:
                            orden,

                        activo:
                            true
                    });

        }


        if (resultado.error) {

            throw resultado.error;

        }


        mensaje.textContent =
            id
                ? "Carpeta actualizada correctamente."
                : "Carpeta creada correctamente.";


        mensaje.className =
            "mensaje exito";


        await cargarSeccionesMateria();


        // Si se editó la carpeta actualmente abierta,
        // actualizamos la referencia local.

        if (
            id
            &&
            seccionActual
            &&
            Number(
                seccionActual.id
            )
            ===
            Number(id)
        ) {

            const actualizada =
                seccionesMateria.find(
                    item =>
                        Number(item.id)
                        ===
                        Number(id)
                );


            if (actualizada) {

                seccionActual =
                    actualizada;


                rutaSecciones =
                    construirRutaSeccion(
                        actualizada.id
                    );

            }

        }


        await cargarContenidoSeccionActual();


        setTimeout(
            cerrarFormularioCarpeta,
            700
        );

    }
    catch (error) {

        console.error(
            "Error guardando carpeta:",
            error
        );


        mensaje.textContent =
            error?.message ||
            "No fue posible guardar la carpeta.";


        mensaje.className =
            "mensaje error";

    }

}


// ============================================================
// ABRIR CARPETA / SECCIÓN
// ============================================================

async function abrirSeccionMaterial(id) {

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


    rutaSecciones =
        construirRutaSeccion(
            carpeta.id
        );


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    await cargarContenidoSeccionActual();

}


// ============================================================
// CONSTRUIR RUTA DE UNA SECCIÓN
// ============================================================

function construirRutaSeccion(id) {

    const ruta =
        [];


    const visitados =
        new Set();


    let actual =
        seccionesMateria.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    while (actual) {

        // Protección frente a ciclos accidentales.

        if (
            visitados.has(
                Number(actual.id)
            )
        ) {

            console.warn(
                "Se detectó un ciclo en la jerarquía de carpetas."
            );

            break;

        }


        visitados.add(
            Number(actual.id)
        );


        ruta.unshift(
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


    return ruta;

}


// ============================================================
// ACTUALIZAR BREADCRUMB
// ============================================================

function actualizarBreadcrumbMaterial() {

    const contenedor =
        document.getElementById(
            "breadcrumbMaterial"
        );


    if (
        !contenedor
        ||
        !materiaAbierta
    ) {

        return;

    }


    let html = `

        <button
            type="button"
            class="breadcrumb-item"
            onclick="irRaizMateria()"
        >

            ${escaparHTML(
                materiaAbierta.nombre
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
                    class="breadcrumb-separador"
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
                        class="breadcrumb-actual"
                    >

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
                        class="breadcrumb-item"
                        onclick="irASeccionBreadcrumb(${carpeta.id})"
                    >

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
// VOLVER A LA RAÍZ DE LA MATERIA
// ============================================================

async function irRaizMateria() {

    seccionActual =
        null;


    rutaSecciones =
        [];


    materialesSeccionActual =
        [];


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    await cargarContenidoSeccionActual();

}


// ============================================================
// NAVEGAR MEDIANTE BREADCRUMB
// ============================================================

async function irASeccionBreadcrumb(id) {

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


    rutaSecciones =
        construirRutaSeccion(
            carpeta.id
        );


    cerrarFormularioCarpeta();

    cerrarFormularioMaterial();


    await cargarContenidoSeccionActual();

}


// ============================================================
// ICONO SEGÚN TIPO DE MATERIAL
// ============================================================

function obtenerIconoMaterial(tipo) {

    switch (tipo) {

        case "drive":
            return "📄";

        case "video":
            return "🎬";

        case "enlace":
            return "🔗";

        default:
            return "📎";

    }

}


// ============================================================
// NOMBRE LEGIBLE DEL TIPO DE MATERIAL
// ============================================================

function obtenerNombreTipoMaterial(tipo) {

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
// PREPARAR NUEVO MATERIAL ACADÉMICO
// ============================================================

function prepararNuevoMaterialAcademico() {

    if (!materiaAbierta) {

        alert(
            "Primero abre una materia."
        );

        return;

    }


    if (!seccionActual) {

        alert(
            "Primero abre una carpeta. El material debe estar dentro de una carpeta."
        );

        return;

    }


    document.getElementById(
        "materialId"
    ).value =
        "";


    document.getElementById(
        "materialTitulo"
    ).value =
        "";


    document.getElementById(
        "materialDescripcion"
    ).value =
        "";


    document.getElementById(
        "materialTipo"
    ).value =
        "drive";


    document.getElementById(
        "materialUrl"
    ).value =
        "";


    document.getElementById(
        "materialOrden"
    ).value =
        "0";


    document.getElementById(
        "materialActivo"
    ).checked =
        true;


    document.getElementById(
        "materialActivoWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormMaterial"
    ).textContent =
        `Nuevo material en ${seccionActual.nombre}`;


    document.getElementById(
        "mensajeMaterial"
    ).textContent =
        "";


    document.getElementById(
        "formMaterialWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "materialTitulo"
    )?.focus();

}


// ============================================================
// EDITAR MATERIAL ACADÉMICO
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


    document.getElementById(
        "materialId"
    ).value =
        material.id;


    document.getElementById(
        "materialTitulo"
    ).value =
        material.titulo || "";


    document.getElementById(
        "materialDescripcion"
    ).value =
        material.descripcion || "";


    document.getElementById(
        "materialTipo"
    ).value =
        material.tipo || "enlace";


    document.getElementById(
        "materialUrl"
    ).value =
        material.url || "";


    document.getElementById(
        "materialOrden"
    ).value =
        Number(
            material.orden || 0
        );


    document.getElementById(
        "materialActivo"
    ).checked =
        Boolean(
            material.activo
        );


    document.getElementById(
        "materialActivoWrap"
    )?.classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormMaterial"
    ).textContent =
        "Editar material";


    document.getElementById(
        "mensajeMaterial"
    ).textContent =
        "";


    document.getElementById(
        "formMaterialWrap"
    )?.classList.remove(
        "oculto"
    );

}


// ============================================================
// CERRAR FORMULARIO MATERIAL
// ============================================================

function cerrarFormularioMaterial() {

    document.getElementById(
        "formMaterialWrap"
    )?.classList.add(
        "oculto"
    );


    document.getElementById(
        "formMaterialAcademico"
    )?.reset();


    const mensaje =
        document.getElementById(
            "mensajeMaterial"
        );


    if (mensaje) {

        mensaje.textContent =
            "";

    }

}


// ============================================================
// VALIDAR URL
// ============================================================

function esUrlValidaMaterial(url) {

    try {

        const objeto =
            new URL(
                url
            );


        return (
            objeto.protocol === "http:"
            ||
            objeto.protocol === "https:"
        );

    }
    catch {

        return false;

    }

}


// ============================================================
// GUARDAR MATERIAL ACADÉMICO
// ============================================================

async function guardarMaterialAcademico(event) {

    event.preventDefault();


    if (
        !materiaAbierta
        ||
        !seccionActual
    ) {

        alert(
            "No existe una carpeta seleccionada."
        );

        return;

    }


    const id =
        document.getElementById(
            "materialId"
        ).value;


    const titulo =
        document.getElementById(
            "materialTitulo"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "materialDescripcion"
        ).value.trim();


    const tipo =
        document.getElementById(
            "materialTipo"
        ).value;


    const url =
        document.getElementById(
            "materialUrl"
        ).value.trim();


    const orden =
        Number(
            document.getElementById(
                "materialOrden"
            ).value
            || 0
        );


    const activo =
        document.getElementById(
            "materialActivo"
        ).checked;


    const mensaje =
        document.getElementById(
            "mensajeMaterial"
        );


    if (!titulo) {

        mensaje.textContent =
            "Ingrese el título del material.";

        mensaje.className =
            "mensaje error";

        return;

    }


    if (
        ![
            "drive",
            "video",
            "enlace"
        ].includes(
            tipo
        )
    ) {

        mensaje.textContent =
            "Selecciona un tipo de material válido.";

        mensaje.className =
            "mensaje error";

        return;

    }


    if (!url) {

        mensaje.textContent =
            "Ingrese el enlace del material.";

        mensaje.className =
            "mensaje error";

        return;

    }


    if (
        !esUrlValidaMaterial(
            url
        )
    ) {

        mensaje.textContent =
            "El enlace debe comenzar con http:// o https://";

        mensaje.className =
            "mensaje error";

        return;

    }


    mensaje.textContent =
        "Guardando...";

    mensaje.className =
        "mensaje";


    try {

        let resultado;


        if (id) {

            resultado =
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

        }
        else {

            resultado =
                await supabaseClient
                    .from(
                        "material_estudiantes"
                    )
                    .insert({
                        seccion_id:
                            Number(
                                seccionActual.id
                            ),

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

        }


        if (resultado.error) {

            throw resultado.error;

        }


        mensaje.textContent =
            id
                ? "Material actualizado correctamente."
                : "Material creado correctamente.";


        mensaje.className =
            "mensaje exito";


        await cargarContenidoSeccionActual();


        setTimeout(
            cerrarFormularioMaterial,
            700
        );

    }
    catch (error) {

        console.error(
            "Error guardando material:",
            error
        );


        mensaje.textContent =
            error?.message ||
            "No fue posible guardar el material.";


        mensaje.className =
            "mensaje error";

    }

}


// ============================================================
// ABRIR ENLACE DEL MATERIAL
// ============================================================

function abrirEnlaceMaterialAdmin(id) {

    const material =
        materialesSeccionActual.find(
            item =>
                Number(item.id)
                ===
                Number(id)
        );


    if (
        !material
        ||
        !material.url
    ) {

        return;

    }


    if (
        !esUrlValidaMaterial(
            material.url
        )
    ) {

        alert(
            "El enlace de este material no es válido."
        );

        return;

    }


    window.open(
        material.url,
        "_blank",
        "noopener,noreferrer"
    );

}


// ============================================================
// OBSERVACIONES DEL ADMINISTRADOR
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

            <div class="vacio">

                <strong>
                    No fue posible cargar
                    las observaciones.
                </strong>

                <p>

                    ${escaparHTML(
                        error?.message || ""
                    )}

                </p>

            </div>

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
            item =>
                item.estado ===
                "pendiente"
        ).length;


    const atendidas =
        observacionesAdmin.filter(
            item =>
                item.estado ===
                "atendida"
        ).length;


    const elementoTotal =
        document.getElementById(
            "totalObservacionesAdmin"
        );


    const elementoPendientes =
        document.getElementById(
            "totalPendientesAdmin"
        );


    const elementoAtendidas =
        document.getElementById(
            "totalAtendidasAdmin"
        );


    if (elementoTotal) {

        elementoTotal.textContent =
            total;

    }


    if (elementoPendientes) {

        elementoPendientes.textContent =
            pendientes;

    }


    if (elementoAtendidas) {

        elementoAtendidas.textContent =
            atendidas;

    }

}


// ============================================================
// RENDERIZAR OBSERVACIONES
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
                item =>
                    item.estado ===
                    filtroObservacionesAdmin
            );

    }


    if (!lista.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <span class="icono-vacio-admin">
                    💬
                </span>

                <strong>
                    No hay observaciones
                </strong>

                <p>
                    No existen mensajes
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

    const origen =
        String(
            observacion.origen || ""
        ).toLowerCase();


    const esEstudiante =
        origen === "estudiante";


    const iconoOrigen =
        esEstudiante
            ? "🎓"
            : "👨‍🏫";


    const textoOrigen =
        esEstudiante
            ? "Estudiante"
            : "Docente";


    const estado =
        observacion.estado ===
        "atendida"
            ? "atendida"
            : "pendiente";


    const tipo =
        nombreTipoObservacionAdmin(
            observacion.tipo
        );


    const fecha =
        formatearFechaObservacionAdmin(
            observacion.created_at
        );


    const codigoHTML =
        observacion.codigo
            ? `

                <span>

                    Código:

                    <strong>

                        ${escaparHTML(
                            observacion.codigo
                        )}

                    </strong>

                </span>

            `
            : "";


    const grupoHTML =
        observacion.grupo
            ? `

                <span>

                    Grupo:

                    <strong>

                        ${escaparHTML(
                            observacion.grupo
                        )}

                    </strong>

                </span>

            `
            : "";


    return `

        <article
            class="observacion-admin-card ${estado}"
        >

            <div class="cabecera-observacion-admin">

                <div class="origen-observacion-admin">

                    <span class="icono-origen-observacion">

                        ${iconoOrigen}

                    </span>


                    <div>

                        <span class="tipo-origen-observacion">

                            ${textoOrigen}

                        </span>


                        <strong>

                            ${escaparHTML(
                                observacion.nombre ||
                                "Sin nombre"
                            )}

                        </strong>

                    </div>

                </div>


                <span
                    class="estado-observacion-admin ${estado}"
                >

                    ${
                        estado === "atendida"
                            ? "✓ Atendida"
                            : "● Pendiente"
                    }

                </span>

            </div>


            <div class="datos-observacion-admin">

                ${codigoHTML}

                ${grupoHTML}


                <span>

                    Tipo:

                    <strong>

                        ${escaparHTML(
                            tipo
                        )}

                    </strong>

                </span>


                <span>

                    ${escaparHTML(
                        fecha
                    )}

                </span>

            </div>


            <div class="texto-observacion-admin">

                ${escaparHTML(
                    observacion.observacion
                )}

            </div>


            <div class="respuesta-observacion-admin">

                <label
                    for="respuestaObservacion${observacion.id}"
                >

                    Respuesta / nota administrativa

                </label>


                <textarea
                    id="respuestaObservacion${observacion.id}"
                    rows="3"
                    maxlength="1500"
                    placeholder="Escribe una respuesta o nota..."
                >${escaparHTML(
                    observacion.respuesta_admin || ""
                )}</textarea>

            </div>


            <div class="acciones-observacion-admin">

                ${
                    estado === "pendiente"
                        ? `

                            <button
                                type="button"
                                class="btn-atender-observacion"
                                onclick="marcarObservacionAtendida(${Number(
                                    observacion.id
                                )})"
                            >

                                ✓ Marcar atendida

                            </button>

                        `
                        : `

                            <button
                                type="button"
                                class="btn-reabrir-observacion"
                                onclick="reabrirObservacionAdmin(${Number(
                                    observacion.id
                                )})"
                            >

                                ↶ Marcar pendiente

                            </button>

                        `
                }


                <button
                    type="button"
                    class="btn-guardar-respuesta-observacion"
                    onclick="guardarRespuestaObservacionAdmin(${Number(
                        observacion.id
                    )})"
                >

                    Guardar respuesta

                </button>


                <button
                    type="button"
                    class="btn-eliminar-observacion"
                    onclick="eliminarObservacionAdmin(${Number(
                        observacion.id
                    )})"
                >

                    Eliminar

                </button>

            </div>

        </article>

    `;

}


// ============================================================
// NOMBRE LEGIBLE DEL TIPO DE OBSERVACIÓN
// ============================================================

function nombreTipoObservacionAdmin(
    tipo
) {

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

            return tipo || "Otro";

    }

}


// ============================================================
// FORMATEAR FECHA DE OBSERVACIÓN
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
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        ).format(
            new Date(
                fecha
            )
        );

    }
    catch {

        return String(
            fecha
        );

    }

}
// ============================================================
// ACTUALIZAR OBSERVACIÓN
// ============================================================

async function actualizarObservacionAdmin(
    id,
    estado
) {

    const textarea =
        document.getElementById(
            `respuestaObservacion${id}`
        );


    const respuesta =
        textarea?.value.trim() || null;


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
                    respuesta
            }
        );


    if (error) {

        throw error;

    }

}


// ============================================================
// MARCAR OBSERVACIÓN COMO ATENDIDA
// ============================================================

async function marcarObservacionAtendida(
    id
) {

    try {

        await actualizarObservacionAdmin(
            id,
            "atendida"
        );


        await cargarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error actualizando observación:",
            error
        );


        alert(
            error?.message ||
            "No fue posible actualizar la observación."
        );

    }

}


// ============================================================
// REABRIR OBSERVACIÓN
// ============================================================

async function reabrirObservacionAdmin(
    id
) {

    try {

        await actualizarObservacionAdmin(
            id,
            "pendiente"
        );


        await cargarObservacionesAdmin();

    }
    catch (error) {

        console.error(
            "Error reabriendo observación:",
            error
        );


        alert(
            error?.message ||
            "No fue posible actualizar la observación."
        );

    }

}


// ============================================================
// GUARDAR RESPUESTA SIN CAMBIAR EL ESTADO
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


    try {

        await actualizarObservacionAdmin(
            id,
            observacion.estado
        );


        await cargarObservacionesAdmin();


        alert(
            "Respuesta guardada correctamente."
        );

    }
    catch (error) {

        console.error(
            "Error guardando respuesta:",
            error
        );


        alert(
            error?.message ||
            "No fue posible guardar la respuesta."
        );

    }

}


// ============================================================
// ELIMINAR OBSERVACIÓN
// ============================================================

async function eliminarObservacionAdmin(
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


    const confirmar =
        window.confirm(
            `¿Eliminar la observación de ${
                observacion.nombre ||
                "este usuario"
            }?\n\nEsta acción no se puede deshacer.`
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
            error?.message ||
            "No fue posible eliminar la observación."
        );

    }

}


// ============================================================
// TEMA CETA
// MODO CLARO / OSCURO
// ============================================================

function instalarTemaCeta() {

    // --------------------------------------------------------
    // CARGAR AUTOMÁTICAMENTE EL CSS DEL TEMA
    // --------------------------------------------------------

    const idCss =
        "temaCetaCss";


    if (
        !document.getElementById(
            idCss
        )
    ) {

        const link =
            document.createElement(
                "link"
            );


        link.id =
            idCss;


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
        );


    aplicarTemaAdministrador(
        temaGuardado === "oscuro"
            ? "oscuro"
            : "claro"
    );


    // --------------------------------------------------------
    // EVITAR CREAR DOS BOTONES
    // --------------------------------------------------------

    if (
        document.getElementById(
            "btnTemaAdministrador"
        )
    ) {

        actualizarTextoBotonTemaAdministrador();

        return;

    }


    // --------------------------------------------------------
    // CREAR BOTÓN
    // --------------------------------------------------------

    const boton =
        document.createElement(
            "button"
        );


    boton.id =
        "btnTemaAdministrador";


    boton.type =
        "button";


    boton.className =
        "btn-tema-ceta";


    boton.title =
        "Cambiar modo claro u oscuro";


    boton.setAttribute(
        "aria-label",
        "Cambiar modo claro u oscuro"
    );


    // --------------------------------------------------------
    // COLOCAR JUNTO A CERRAR SESIÓN
    // --------------------------------------------------------

    const btnCerrar =
        document.getElementById(
            "btnCerrarSesion"
        );


    if (
        btnCerrar
        &&
        btnCerrar.parentElement
    ) {

        btnCerrar.parentElement.insertBefore(
            boton,
            btnCerrar
        );

    }
    else {

        // Si la cabecera cambiara en el futuro,
        // el botón aparecerá flotando.

        document.body.appendChild(
            boton
        );


        boton.classList.add(
            "btn-tema-flotante"
        );

    }


    actualizarTextoBotonTemaAdministrador();


    // --------------------------------------------------------
    // CAMBIAR TEMA
    // --------------------------------------------------------

    boton.addEventListener(
        "click",
        () => {

            const oscuro =
                document.documentElement
                    .classList
                    .contains(
                        "tema-oscuro"
                    );


            const nuevoTema =
                oscuro
                    ? "claro"
                    : "oscuro";


            localStorage.setItem(
                "ceta_tema",
                nuevoTema
            );


            aplicarTemaAdministrador(
                nuevoTema
            );


            actualizarTextoBotonTemaAdministrador();

        }
    );

}


// ============================================================
// APLICAR TEMA
// ============================================================

function aplicarTemaAdministrador(
    tema
) {

    const oscuro =
        tema === "oscuro";


    document.documentElement
        .classList
        .toggle(
            "tema-oscuro",
            oscuro
        );


    if (document.body) {

        document.body.classList.toggle(
            "tema-oscuro",
            oscuro
        );

    }

}


// ============================================================
// TEXTO DEL BOTÓN DE TEMA
// ============================================================

function actualizarTextoBotonTemaAdministrador() {

    const boton =
        document.getElementById(
            "btnTemaAdministrador"
        );


    if (!boton) {

        return;

    }


    const oscuro =
        document.documentElement
            .classList
            .contains(
                "tema-oscuro"
            );


    boton.textContent =
        oscuro
            ? "☀️ Modo claro"
            : "🌙 Modo oscuro";

}


// ============================================================
// ESCAPAR HTML
// Evita que texto introducido por usuarios se interprete
// como código HTML.
// ============================================================

function escaparHTML(valor) {

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
// FIN DE ADMIN.JS
// ============================================================

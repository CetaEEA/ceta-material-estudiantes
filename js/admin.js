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
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPanelAdministrador
);


async function iniciarPanelAdministrador() {

    registrarEventos();

    const autorizado =
        await protegerPanelAdministrador();


    if (!autorizado) {
        return;
    }


    await Promise.all([
        cargarEstadisticas(),
        cargarGrupos()
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
                    .from("estudiantes_ceta")
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
                    .from("grupos_estudiantes")
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
                    .from("estudiantes_ceta")
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
                    .from("materias_estudiantes")
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


        document.getElementById(
            "totalEstudiantes"
        ).textContent =
            estudiantes.count ?? 0;


        document.getElementById(
            "totalGrupos"
        ).textContent =
            gruposResultado.count ?? 0;


        document.getElementById(
            "totalEgresados"
        ).textContent =
            egresados.count ?? 0;


        document.getElementById(
            "totalMaterias"
        ).textContent =
            materias.count ?? 0;

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


    contenedor.innerHTML =
        `<p class="estado-carga">
            Cargando grupos...
        </p>`;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("grupos_estudiantes")
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

        console.error(error);

        contenedor.innerHTML =
            `<p class="mensaje error">
                No se pudieron cargar los grupos.
            </p>`;

        return;

    }


    grupos =
        data || [];


    renderizarGrupos();

}


// ============================================================
// MOSTRAR GRUPOS
// ============================================================

function renderizarGrupos() {

    const contenedor =
        document.getElementById(
            "listaGrupos"
        );


    if (!grupos.length) {

        contenedor.innerHTML = `
            <div class="vacio">
                <span>👥</span>

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
                            class="grupo-card
                            ${
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
                                        ${escaparHTML(grupo.codigo_grupo)}
                                    </strong>

                                    <small>
                                        ${grupo.semestre}° semestre
                                    </small>

                                </div>

                                <span
                                    class="estado-badge
                                    ${
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
// NUEVO GRUPO
// ============================================================

function prepararNuevoGrupo() {

    document.getElementById(
        "formGrupo"
    ).reset();


    document.getElementById(
        "grupoId"
    ).value = "";


    document.getElementById(
        "grupoActivo"
    ).checked = true;


    document.getElementById(
        "contenedorGrupoActivo"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormularioGrupo"
    ).textContent =
        "Crear grupo";


    mostrarMensajeAdmin(
        "mensajeGrupo",
        ""
    );


    document.getElementById(
        "formularioGrupoContenedor"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "codigoGrupo"
    ).focus();

}


// ============================================================
// EDITAR GRUPO
// ============================================================

function editarGrupo(id) {

    const grupo =
        grupos.find(
            item => item.id === id
        );


    if (!grupo) {
        return;
    }


    document.getElementById(
        "grupoId"
    ).value =
        grupo.id;


    document.getElementById(
        "codigoGrupo"
    ).value =
        grupo.codigo_grupo;


    document.getElementById(
        "semestreGrupo"
    ).value =
        String(grupo.semestre);


    document.getElementById(
        "grupoActivo"
    ).checked =
        grupo.activo;


    document.getElementById(
        "contenedorGrupoActivo"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormularioGrupo"
    ).textContent =
        "Editar grupo";


    mostrarMensajeAdmin(
        "mensajeGrupo",
        ""
    );


    document.getElementById(
        "formularioGrupoContenedor"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "formularioGrupoContenedor"
    ).scrollIntoView({
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
        ).value;


    const codigo =
        document.getElementById(
            "codigoGrupo"
        ).value
            .trim()
            .toUpperCase();


    const semestre =
        Number(
            document.getElementById(
                "semestreGrupo"
            ).value
        );


    const activo =
        document.getElementById(
            "grupoActivo"
        ).checked;


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


    boton.disabled = true;

    boton.textContent =
        "GUARDANDO...";


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

        console.error(error);


        mostrarMensajeAdmin(
            "mensajeGrupo",
            obtenerMensajeError(error)
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "GUARDAR";

    }

}


// ============================================================
// CERRAR FORMULARIO GRUPO
// ============================================================

function cerrarFormularioGrupo() {

    document.getElementById(
        "formularioGrupoContenedor"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "formGrupo"
    ).reset();


    document.getElementById(
        "grupoId"
    ).value = "";


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
            item => item.id === id
        );


    if (!grupo) {
        return;
    }


    grupoSeleccionado =
        grupo;


    renderizarGrupos();


    document.getElementById(
        "panelEstudiantesGrupo"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloGrupoSeleccionado"
    ).textContent =
        grupo.codigo_grupo;


    document.getElementById(
        "semestreGrupoSeleccionado"
    ).textContent =
        `${grupo.semestre}° semestre`;


    cerrarFormularioEstudiante();


    await cargarEstudiantesGrupo();


    document.getElementById(
        "panelEstudiantesGrupo"
    ).scrollIntoView({
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


    contenedor.innerHTML =
        `<p class="estado-carga">
            Cargando estudiantes...
        </p>`;


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

        console.error(error);


        contenedor.innerHTML =
            `<p class="mensaje error">
                No se pudieron cargar los estudiantes.
            </p>`;

        return;

    }


    estudiantesGrupo =
        data || [];


    renderizarEstudiantes();

}


// ============================================================
// MOSTRAR ESTUDIANTES
// ============================================================

function renderizarEstudiantes() {

    const contenedor =
        document.getElementById(
            "listaEstudiantes"
        );


    const busqueda =
        document.getElementById(
            "buscarEstudiante"
        )
        .value
        .trim()
        .toLowerCase();


    const filtrados =
        estudiantesGrupo.filter(
            estudiante => {

                return (
                    estudiante.nombre
                        .toLowerCase()
                        .includes(busqueda)
                    ||
                    estudiante.codigo_ceta
                        .toLowerCase()
                        .includes(busqueda)
                );

            }
        );


    if (!filtrados.length) {

        contenedor.innerHTML = `
            <div class="vacio">

                <span>👨‍🎓</span>

                <strong>
                    No hay estudiantes para mostrar
                </strong>

                <p>
                    Puedes agregarlos manualmente.
                </p>

            </div>
        `;

        return;

    }


    contenedor.innerHTML = `
        <div class="tabla-responsive">

            <table class="tabla-admin">

                <thead>

                    <tr>
                        <th>Código CETA</th>
                        <th>Estudiante</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>

                </thead>

                <tbody>

                    ${
                        filtrados
                            .map(
                                estudiante => `
                                    <tr>

                                        <td>
                                            <strong>
                                                ${escaparHTML(estudiante.codigo_ceta)}
                                            </strong>
                                        </td>

                                        <td>
                                            ${escaparHTML(estudiante.nombre)}
                                        </td>

                                        <td>

                                            <span
                                                class="estado-badge
                                                ${
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


    document.getElementById(
        "formEstudianteAdmin"
    ).reset();


    document.getElementById(
        "estudianteId"
    ).value = "";


    document.getElementById(
        "estudianteActivo"
    ).checked = true;


    document.getElementById(
        "contenedorEstudianteActivo"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "tituloFormularioEstudiante"
    ).textContent =
        `Agregar estudiante a ${grupoSeleccionado.codigo_grupo}`;


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );


    document.getElementById(
        "formularioEstudianteContenedor"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "codigoCetaAdmin"
    ).focus();

}


// ============================================================
// EDITAR ESTUDIANTE
// ============================================================

function editarEstudiante(id) {

    const estudiante =
        estudiantesGrupo.find(
            item => item.id === id
        );


    if (!estudiante) {
        return;
    }


    document.getElementById(
        "estudianteId"
    ).value =
        estudiante.id;


    document.getElementById(
        "codigoCetaAdmin"
    ).value =
        estudiante.codigo_ceta;


    document.getElementById(
        "nombreEstudiante"
    ).value =
        estudiante.nombre;


    document.getElementById(
        "estudianteActivo"
    ).checked =
        estudiante.activo;


    document.getElementById(
        "contenedorEstudianteActivo"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "tituloFormularioEstudiante"
    ).textContent =
        "Editar estudiante";


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );


    document.getElementById(
        "formularioEstudianteContenedor"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "formularioEstudianteContenedor"
    ).scrollIntoView({
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
        ).value;


    const codigo =
        document.getElementById(
            "codigoCetaAdmin"
        ).value
        .trim();


    const nombre =
        document.getElementById(
            "nombreEstudiante"
        ).value
        .trim();


    const activo =
        document.getElementById(
            "estudianteActivo"
        ).checked;


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


    boton.disabled = true;

    boton.textContent =
        "GUARDANDO...";


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

        console.error(error);


        mostrarMensajeAdmin(
            "mensajeEstudianteAdmin",
            obtenerMensajeError(error)
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "GUARDAR";

    }

}


// ============================================================
// CERRAR FORMULARIO ESTUDIANTE
// ============================================================

function cerrarFormularioEstudiante() {

    document.getElementById(
        "formularioEstudianteContenedor"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "formEstudianteAdmin"
    ).reset();


    document.getElementById(
        "estudianteId"
    ).value = "";


    mostrarMensajeAdmin(
        "mensajeEstudianteAdmin",
        ""
    );

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
        error?.message ||
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
        mensaje.includes(
            "No autorizado"
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
// PARTE 8B
// IMPORTACIÓN DE EXCEL
// ============================================================


function abrirImportacionExcel() {

    if (!grupoSeleccionado) {
        return;
    }


    cerrarPromocion();


    estudiantesExcel = [];


    document.getElementById(
        "archivoExcel"
    ).value = "";


    document.getElementById(
        "vistaPreviaExcel"
    ).innerHTML = "";


    document.getElementById(
        "resumenExcel"
    ).classList.add(
        "oculto"
    );


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );


    document.getElementById(
        "panelImportarExcel"
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "panelImportarExcel"
    ).scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// CERRAR EXCEL
// ============================================================

function cerrarImportacionExcel() {

    estudiantesExcel = [];


    const input =
        document.getElementById(
            "archivoExcel"
        );


    if (input) {
        input.value = "";
    }


    document.getElementById(
        "panelImportarExcel"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "resumenExcel"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "vistaPreviaExcel"
    ).innerHTML = "";


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );

}


// ============================================================
// NORMALIZAR ENCABEZADO
// ============================================================

function normalizarEncabezado(texto) {

    return String(texto ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]/g,
            ""
        );

}


// ============================================================
// DETECTAR COLUMNAS
// ============================================================

function detectarColumnasExcel(fila) {

    const columnas =
        Object.keys(fila);


    let columnaNombre = null;

    let columnaCodigo = null;


    for (const columna of columnas) {

        const normalizada =
            normalizarEncabezado(
                columna
            );


        if (
            !columnaNombre
            &&
            (
                normalizada === "nombre"
                ||
                normalizada === "nombres"
                ||
                normalizada === "nombrecompleto"
                ||
                normalizada === "estudiante"
                ||
                normalizada === "alumno"
                ||
                normalizada === "alumnos"
            )
        ) {

            columnaNombre =
                columna;

        }


        if (
            !columnaCodigo
            &&
            (
                normalizada === "codigo"
                ||
                normalizada === "codigoceta"
                ||
                normalizada === "codceta"
                ||
                normalizada === "codigoestudiante"
                ||
                normalizada === "cod"
            )
        ) {

            columnaCodigo =
                columna;

        }

    }


    return {
        columnaNombre,
        columnaCodigo
    };

}


// ============================================================
// LEER EXCEL
// ============================================================

async function leerArchivoExcel(event) {

    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );


    estudiantesExcel = [];


    document.getElementById(
        "resumenExcel"
    ).classList.add(
        "oculto"
    );


    const archivo =
        event.target.files?.[0];


    if (!archivo) {
        return;
    }


    const extension =
        archivo.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        extension !== "xlsx"
        &&
        extension !== "xls"
    ) {

        mostrarMensajeAdmin(
            "mensajeExcel",
            "Selecciona un archivo Excel .xlsx o .xls."
        );

        event.target.value = "";

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
                "El archivo no contiene hojas."
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


        const {
            columnaNombre,
            columnaCodigo
        } =
            detectarColumnasExcel(
                filas[0]
            );


        if (
            !columnaNombre
            ||
            !columnaCodigo
        ) {

            throw new Error(
                "No se encontraron las columnas de NOMBRE y CÓDIGO CETA."
            );

        }


        const procesados = [];

        const codigos =
            new Set();


        for (let i = 0; i < filas.length; i++) {

            const fila =
                filas[i];


            const nombre =
                String(
                    fila[columnaNombre] ?? ""
                )
                .trim();


            const codigo =
                String(
                    fila[columnaCodigo] ?? ""
                )
                .trim();


            // Ignoramos filas completamente vacías.
            if (
                !nombre
                &&
                !codigo
            ) {

                continue;

            }


            if (!nombre) {

                throw new Error(
                    `Fila ${i + 2}: falta el nombre del estudiante.`
                );

            }


            if (!codigo) {

                throw new Error(
                    `Fila ${i + 2}: falta el código CETA.`
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
                    `El código CETA ${codigo} está repetido en el Excel.`
                );

            }


            codigos.add(
                codigoNormalizado
            );


            procesados.push({
                codigo_ceta: codigo,
                nombre: nombre
            });

        }


        if (!procesados.length) {

            throw new Error(
                "No se encontraron estudiantes válidos."
            );

        }


        estudiantesExcel =
            procesados;


        mostrarVistaPreviaExcel();

    }
    catch (error) {

        console.error(
            "Error leyendo Excel:",
            error
        );


        estudiantesExcel = [];


        mostrarMensajeAdmin(
            "mensajeExcel",
            error.message ||
            "No se pudo leer el archivo Excel."
        );

    }

}


// ============================================================
// PREVISUALIZACIÓN
// ============================================================

function mostrarVistaPreviaExcel() {

    document.getElementById(
        "cantidadExcel"
    ).textContent =
        `${estudiantesExcel.length} estudiante${
            estudiantesExcel.length === 1
                ? ""
                : "s"
        }`;


    const primeros =
        estudiantesExcel.slice(
            0,
            20
        );


    document.getElementById(
        "vistaPreviaExcel"
    ).innerHTML = `

        <table class="tabla-admin">

            <thead>

                <tr>
                    <th>#</th>
                    <th>Código CETA</th>
                    <th>Estudiante</th>
                </tr>

            </thead>

            <tbody>

                ${
                    primeros
                        .map(
                            (estudiante, indice) => `
                                <tr>

                                    <td>
                                        ${indice + 1}
                                    </td>

                                    <td>
                                        <strong>
                                            ${escaparHTML(estudiante.codigo_ceta)}
                                        </strong>
                                    </td>

                                    <td>
                                        ${escaparHTML(estudiante.nombre)}
                                    </td>

                                </tr>
                            `
                        )
                        .join("")
                }

            </tbody>

        </table>

        ${
            estudiantesExcel.length > 20
                ? `
                    <p class="nota-vista-previa">
                        Mostrando los primeros 20 de
                        ${estudiantesExcel.length} estudiantes.
                    </p>
                `
                : ""
        }
    `;


    document.getElementById(
        "resumenExcel"
    ).classList.remove(
        "oculto"
    );

}


// ============================================================
// CONFIRMAR IMPORTACIÓN
// ============================================================

async function confirmarImportacionExcel() {

    if (
        !grupoSeleccionado
        ||
        !estudiantesExcel.length
    ) {

        return;

    }


    const confirmado =
        window.confirm(
            `¿Reemplazar la lista del grupo ${grupoSeleccionado.codigo_grupo} con ${estudiantesExcel.length} estudiantes?\n\n` +
            `Los estudiantes que no aparezcan en el nuevo Excel serán retirados del grupo y desactivados.`
        );


    if (!confirmado) {
        return;
    }


    const boton =
        document.getElementById(
            "btnConfirmarExcel"
        );


    boton.disabled = true;

    boton.textContent =
        "IMPORTANDO...";


    mostrarMensajeAdmin(
        "mensajeExcel",
        ""
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "reemplazar_lista_grupo_estudiantes",
                {
                    p_grupo_id:
                        grupoSeleccionado.id,

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
            resultado?.procesados ?? 0;

        const nuevos =
            resultado?.nuevos ?? 0;

        const actualizados =
            resultado?.actualizados ?? 0;

        const retirados =
            resultado?.retirados ?? 0;


        alert(
            `Lista importada correctamente.\n\n` +
            `Procesados: ${procesados}\n` +
            `Nuevos: ${nuevos}\n` +
            `Actualizados: ${actualizados}\n` +
            `Retirados: ${retirados}`
        );


        cerrarImportacionExcel();


        await Promise.all([
            cargarEstudiantesGrupo(),
            cargarEstadisticas()
        ]);

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

        boton.disabled = false;

        boton.textContent =
            "CONFIRMAR IMPORTACIÓN";

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


    mostrarMensajeAdmin(
        "mensajePromocion",
        ""
    );


    // ========================================================
    // SEXTO SEMESTRE -> EGRESADOS
    // ========================================================

    if (
        grupoSeleccionado.semestre === 6
    ) {

        contenido.innerHTML = `

            <div class="promocion-resumen">

                <div>
                    <small>
                        GRUPO ACTUAL
                    </small>

                    <strong>
                        ${escaparHTML(grupoSeleccionado.codigo_grupo)}
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
                    ${escaparHTML(grupoSeleccionado.codigo_grupo)}
                </strong>
                pasarán a estado
                <strong>egresado</strong> y dejarán de
                pertenecer al grupo.

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
    // BUSCAR GRUPOS DEL SIGUIENTE SEMESTRE
    // ========================================================

    const siguienteSemestre =
        grupoSeleccionado.semestre + 1;


    const destinos =
        grupos.filter(
            grupo =>
                grupo.activo
                &&
                grupo.semestre === siguienteSemestre
                &&
                grupo.id !== grupoSeleccionado.id
        );


    if (!destinos.length) {

        contenido.innerHTML = `

            <div class="aviso-importante">

                No existe ningún grupo activo de
                <strong>
                    ${siguienteSemestre}° semestre
                </strong>.

                <br><br>

                Primero crea el grupo de destino y luego
                vuelve a realizar la promoción.

            </div>
        `;


        document.getElementById(
            "btnConfirmarPromocion"
        ).classList.add(
            "oculto"
        );

    }
    else {

        document.getElementById(
            "btnConfirmarPromocion"
        ).classList.remove(
            "oculto"
        );


        contenido.innerHTML = `

            <div class="promocion-resumen">

                <div>

                    <small>
                        ORIGEN
                    </small>

                    <strong>
                        ${escaparHTML(grupoSeleccionado.codigo_grupo)}
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
                                        <option value="${grupo.id}">
                                            ${escaparHTML(grupo.codigo_grupo)}
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
                <strong>activos</strong>
                del grupo serán trasladados al grupo
                seleccionado.

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


    const panel =
        document.getElementById(
            "panelPromocion"
        );


    if (panel) {

        panel.classList.add(
            "oculto"
        );

    }


    const boton =
        document.getElementById(
            "btnConfirmarPromocion"
        );


    if (boton) {

        boton.classList.remove(
            "oculto"
        );

    }


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


    // ========================================================
    // SEXTO -> EGRESADOS
    // ========================================================

    if (
        grupoSeleccionado.semestre === 6
    ) {

        const confirmado =
            window.confirm(
                `¿Promover a EGRESADOS a todos los estudiantes activos de ${grupoSeleccionado.codigo_grupo}?\n\n` +
                `Los egresados tendrán acceso al material de los seis semestres.`
            );


        if (!confirmado) {
            return;
        }


        boton.disabled = true;

        boton.textContent =
            "PROCESANDO...";


        try {

            const {
                data,
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


            const cantidad =
                data ?? 0;


            alert(
                `${cantidad} estudiante${
                    Number(cantidad) === 1
                        ? ""
                        : "s"
                } promovido${
                    Number(cantidad) === 1
                        ? ""
                        : "s"
                } a egresados.`
            );


            cerrarPromocion();


            await Promise.all([
                cargarEstudiantesGrupo(),
                cargarEstadisticas()
            ]);

        }
        catch (error) {

            console.error(error);


            mostrarMensajeAdmin(
                "mensajePromocion",
                obtenerMensajeError(error)
            );

        }
        finally {

            boton.disabled = false;

            boton.textContent =
                "CONFIRMAR PROMOCIÓN";

        }


        return;

    }


    // ========================================================
    // PROMOCIÓN ENTRE SEMESTRES
    // ========================================================

    const select =
        document.getElementById(
            "selectGrupoDestino"
        );


    const destinoId =
        Number(
            select?.value
        );


    if (!destinoId) {

        mostrarMensajeAdmin(
            "mensajePromocion",
            "Selecciona el grupo de destino."
        );

        return;

    }


    const destino =
        grupos.find(
            grupo =>
                grupo.id === destinoId
        );


    if (!destino) {

        mostrarMensajeAdmin(
            "mensajePromocion",
            "El grupo de destino no es válido."
        );

        return;

    }


    const confirmado =
        window.confirm(
            `¿Promover los estudiantes de ${grupoSeleccionado.codigo_grupo} a ${destino.codigo_grupo}?`
        );


    if (!confirmado) {
        return;
    }


    boton.disabled = true;

    boton.textContent =
        "PROMOVIENDO...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "promover_grupo_estudiantes",
                {
                    p_grupo_origen_id:
                        grupoSeleccionado.id,

                    p_grupo_destino_id:
                        destino.id
                }
            );


        if (error) {
            throw error;
        }


        const cantidad =
            data ?? 0;


        alert(
            `${cantidad} estudiante${
                Number(cantidad) === 1
                    ? ""
                    : "s"
            } promovido${
                Number(cantidad) === 1
                    ? ""
                    : "s"
            } de ${grupoSeleccionado.codigo_grupo} a ${destino.codigo_grupo}.`
        );


        cerrarPromocion();


        await Promise.all([
            cargarEstudiantesGrupo(),
            cargarEstadisticas()
        ]);

    }
    catch (error) {

        console.error(error);


        mostrarMensajeAdmin(
            "mensajePromocion",
            obtenerMensajeError(error)
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "CONFIRMAR PROMOCIÓN";

    }

}

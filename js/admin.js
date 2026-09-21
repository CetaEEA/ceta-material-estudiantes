// ============================================================
// CETA - MATERIAL ACADÉMICO
// PANEL ADMINISTRADOR
// ============================================================


let perfilAdministrador = null;

let grupos = [];

let estudiantesGrupo = [];

let grupoSeleccionado = null;


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

// ============================================================
// CETA - MATERIAL ACADÉMICO
// LOGIN
// ADMINISTRADOR / DOCENTE / ESTUDIANTE
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    iniciarLogin
);


// ============================================================
// INICIAR
// ============================================================

async function iniciarLogin() {

    registrarEventos();

    await comprobarSesionPersonal();

}


// ============================================================
// EVENTOS
// ============================================================

function registrarEventos() {

    const formPersonal =
        document.getElementById("formPersonal");

    const formEstudiante =
        document.getElementById("formEstudiante");


    if (formPersonal) {

        formPersonal.addEventListener(
            "submit",
            iniciarSesionPersonal
        );

    }


    if (formEstudiante) {

        formEstudiante.addEventListener(
            "submit",
            iniciarSesionEstudiante
        );

    }

}


// ============================================================
// MENSAJES
// ============================================================

function mostrarMensaje(
    elemento,
    texto,
    tipo = "error"
) {

    if (!elemento) {
        return;
    }


    elemento.textContent = texto;

    elemento.classList.remove(
        "error",
        "exito"
    );


    if (texto) {
        elemento.classList.add(tipo);
    }

}


// ============================================================
// COMPROBAR SI YA EXISTE SESIÓN DE PERSONAL
// ============================================================

async function comprobarSesionPersonal() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {
            return;
        }


        const session = data?.session;


        if (!session?.user) {
            return;
        }


        await redirigirSegunPerfil(
            session.user.id
        );

    }
    catch (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

    }

}


// ============================================================
// LOGIN DOCENTE / ADMINISTRADOR
// ============================================================

async function iniciarSesionPersonal(event) {

    event.preventDefault();


    const usuarioInput =
        document.getElementById("usuario");

    const passwordInput =
        document.getElementById("password");

    const mensaje =
        document.getElementById("mensajePersonal");

    const boton =
        document.getElementById("btnIngresarPersonal");


    const usuario =
        usuarioInput.value
            .trim()
            .toLowerCase();

    const password =
        passwordInput.value;


    mostrarMensaje(
        mensaje,
        ""
    );


    if (!usuario || !password) {

        mostrarMensaje(
            mensaje,
            "Completa usuario y contraseña."
        );

        return;

    }


    boton.disabled = true;

    boton.textContent =
        "INGRESANDO...";


    try {

        // ----------------------------------------------------
        // MISMO SISTEMA DE CUENTAS QUE GABINETE
        // usuario@ceta.internal
        // ----------------------------------------------------

        const email =
            `${usuario}@ceta.internal`;


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        if (error) {

            throw new Error(
                "Usuario o contraseña incorrectos."
            );

        }


        if (!data?.user) {

            throw new Error(
                "No se pudo iniciar sesión."
            );

        }


        await redirigirSegunPerfil(
            data.user.id
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensaje(
            mensaje,
            error.message ||
            "No se pudo iniciar sesión."
        );


        await supabaseClient.auth.signOut();

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "INGRESAR";

    }

}


// ============================================================
// REDIRECCIÓN ADMIN / DOCENTE
// ============================================================

async function redirigirSegunPerfil(
    usuarioId
) {

    const {
        data: perfil,
        error
    } =
        await supabaseClient
            .from("perfiles")
            .select(
                "id, usuario, nombre, rol, activo"
            )
            .eq(
                "id",
                usuarioId
            )
            .single();


    if (error || !perfil) {

        await supabaseClient.auth.signOut();

        throw new Error(
            "No se encontró el perfil del usuario."
        );

    }


    if (!perfil.activo) {

        await supabaseClient.auth.signOut();

        throw new Error(
            "Tu cuenta se encuentra deshabilitada."
        );

    }


    if (perfil.rol === "administrador") {

        window.location.href =
            "admin.html";

        return;

    }


    if (perfil.rol === "docente") {

        window.location.href =
            "docente.html";

        return;

    }


    await supabaseClient.auth.signOut();


    throw new Error(
        "Tu cuenta no tiene acceso a este sistema."
    );

}


// ============================================================
// LOGIN ESTUDIANTE
// ============================================================

async function iniciarSesionEstudiante(event) {

    event.preventDefault();


    const codigoInput =
        document.getElementById("codigoCeta");

    const mensaje =
        document.getElementById(
            "mensajeEstudiante"
        );

    const boton =
        document.getElementById(
            "btnIngresarEstudiante"
        );


    const codigo =
        codigoInput.value.trim();


    mostrarMensaje(
        mensaje,
        ""
    );


    if (!codigo) {

        mostrarMensaje(
            mensaje,
            "Ingresa tu código CETA."
        );

        return;

    }


    boton.disabled = true;

    boton.textContent =
        "VERIFICANDO...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "iniciar_sesion_estudiante",
                {
                    p_codigo_ceta: codigo
                }
            );


        if (error) {
            throw error;
        }


        if (
            !Array.isArray(data)
            ||
            data.length === 0
            ||
            !data[0]?.token
        ) {

            throw new Error(
                "No se pudo iniciar la sesión."
            );

        }


        const sesion =
            data[0];


        // ----------------------------------------------------
        // Guardamos únicamente el token temporal.
        //
        // Nombre, grupo y semestre NO se utilizarán como
        // autorización. estudiante.html volverá a consultar
        // Supabase usando el token.
        // ----------------------------------------------------

        sessionStorage.setItem(
            "ceta_estudiante_token",
            sesion.token
        );


        window.location.href =
            "estudiante.html";

    }
    catch (error) {

        console.error(
            "Error estudiante:",
            error
        );


        let texto =
            error?.message ||
            "No se pudo verificar el código CETA.";


        if (
            texto.includes(
                "Código CETA no válido"
            )
        ) {

            texto =
                "Código CETA no válido o estudiante inactivo.";

        }


        mostrarMensaje(
            mensaje,
            texto
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "ACCEDER AL MATERIAL";

    }

}

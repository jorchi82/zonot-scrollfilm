// Redirige la home a /de/ para visitantes de Alemania, Suiza o Austria — una
// sola vez. Respeta la cookie zonot_lang si el usuario ya eligió idioma (a
// mano con el toggle ES·DE, o porque ya pasó por aquí antes).
//
// Regla de oro: esto es una mejora opcional, NUNCA debe poder tumbar la
// página. Todo el cuerpo está en un try/catch — cualquier error, por lo que
// sea, deja pasar la petición sin tocarla en vez de propagar la excepción.
const DE_COUNTRIES = new Set(["DE", "CH", "AT"]);
const COOKIE = "zonot_lang";

export default async (request, context) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    if (cookieHeader.includes(`${COOKIE}=`)) {
      return; // el usuario ya tiene preferencia guardada: no se toca
    }

    const country = context && context.geo && context.geo.country && context.geo.country.code;
    if (!country || !DE_COUNTRIES.has(country)) {
      return; // fuera de la región DACH, o sin dato de geo: sigue normal
    }

    const dest = new URL("/de/", request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: dest,
        "Set-Cookie": `${COOKIE}=de; Path=/; Max-Age=31536000; SameSite=Lax`,
      },
    });
  } catch (_err) {
    return; // cualquier fallo inesperado: la home se sirve normal, sin redirigir
  }
};

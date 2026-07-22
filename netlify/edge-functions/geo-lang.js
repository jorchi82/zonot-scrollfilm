// Redirige la home a /de/ para visitantes de Alemania, Suiza o Austria —
// una sola vez. Respeta la cookie zonot_lang si el usuario ya eligió idioma
// (a mano con el toggle ES·DE, o porque ya pasó por aquí antes).
const DE_COUNTRIES = new Set(["DE", "CH", "AT"]);
const COOKIE = "zonot_lang";

export default async (request, context) => {
  const cookies = request.headers.get("cookie") || "";
  if (cookies.includes(`${COOKIE}=`)) {
    return; // el usuario ya tiene preferencia guardada: no se toca
  }

  const country = context.geo?.country?.code;
  if (!country || !DE_COUNTRIES.has(country)) {
    return; // fuera de la región DACH: sigue normal en español
  }

  const url = new URL(request.url);
  const res = Response.redirect(new URL("/de/", url), 302);
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=de; Path=/; Max-Age=31536000; SameSite=Lax`
  );
  return res;
};

export const config = { path: "/" };

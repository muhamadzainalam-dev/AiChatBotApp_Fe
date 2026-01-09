export default async function verifyToken(router) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    router.push("/screens/Auth");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/tokenverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (data.message === "Access Denied") {
      router.push("/screens/Auth");
    } else {
      router.push("/");
    }
  } catch (err) {
    router.push("/screens/Auth");
  }
}

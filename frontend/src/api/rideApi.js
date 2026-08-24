
const ROUTE = "http://174.129.128.223:8080/api/rides";

export const uploadRide = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${ROUTE}/upload`, { method: 'POST', body: form});

    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export const getAllRides = async () => {
    const res = await fetch(ROUTE);

    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export const getRideByID = async (id) => {
    const res = await fetch(`${ROUTE}/${id}`);

    if (!res.ok) throw new Error(await res.text());
    return res.json();
}


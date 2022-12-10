import { useEffect, useState } from "react";

const LandingPage = () => {
    const [success, setSuccess] = useState(null);
    const [data, setData] = useState(null);
    const [uf, setUf] = useState(null);

    const fetchRandomData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Error: Something went wrong"));
            }, 2000);
        });
    };

    useEffect(() => {
        fetchRandomData().then((payload) => {
            setSuccess(true);
            setData(payload)
            // redirect to dashboard
        }).catch((err) => {
            setSuccess(false);
            // ask user for manual UF input
        })
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setUf(e.target.value)
    }

    return (
        <div>
            {success === false ? <div className="w-full h-screen flex flex-col justify-center items-center">
                <p>Lo sentimos, hubo un error y no se pudo cargar automaticamente el valor de la UF. Por favor ingrese la UF de forma manual. </p>
                <form onSubmit={handleSubmit}>
                    <p>Ingrese valor UF:</p>
                    <input type="number" onChange={(e) => setUf(e.target.value)} value={uf} />
                    <button type="submit">Ingresar</button>
                </form>
            </div> : null}
        </div>
    )
}

export default LandingPage;
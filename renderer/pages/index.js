import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useRouter } from 'next/navigation';

const LandingPage = () => {
    const [success, setSuccess] = useState(null);
    const [data, setData] = useState(null);
    const [uf, setUf] = useState(null);

    const router = useRouter();

    const fetchRandomData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Error: Something went wrong"));
            }, 2000);
        });
    };

    const updateUF = () => {
        const date = new Date();

        window.electron.general.overrideUfPrice(date, uf).then(() => {
            router.push("/generateInvoice");
        })
    }

    useEffect(() => {
        window.electron.general.getUfPrice().then((payload) => {
            setSuccess(true);
            setData(payload)
            router.push("/generateInvoice");
        }).catch((err) => {
            setSuccess(false);
        })
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setUf(e.target.value);
        updateUF();
    }

    const LoadingAnimation = (
        <div className="w-full h-screen flex justify-center items-center">
            <ReactLoading type="spinningBubbles" color={"#14b8a6"} height={"100px"} width={"100px"} />
        </div>
    );

    return (
        <div>
            {success === false ? <div className="w-full h-screen flex flex-col justify-center items-center bg-zinc-100">
                <p className="text-lg text-slate-600 mr-2 w-3/5">Lo sentimos, hubo un error y no se pudo cargar automaticamente el valor de la UF. Por favor ingrese la UF de forma manual. </p>
                <form className="flex flex-row m-10" onSubmit={handleSubmit}>
                    <p className="text-lg text-slate-600 mr-2 font-bold w-3/5">Valor UF:</p>
                    <input type="number" className="border rounded-md border-slate-500 outline-none pl-2 mr-2" onChange={(e) => setUf(e.target.value)} value={uf} />
                    <button type="submit" className="text-teal-500 font-bold outline rounded-md px-2">Ingresar</button>
                </form>
            </div> : LoadingAnimation}
        </div>
    )
}

export default LandingPage;
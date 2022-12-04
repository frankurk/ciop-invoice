import { useRef, useState } from "react";

const InvoiceNumber = () => {
    const [invoiceNumber, setInvoiceNumber] = useState(null);

    const handleChange = (e) => {
        setInvoiceNumber(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await window.electron.message.updateCorrelative(invoiceNumber);
        closeModal();
    };

    const modalRef = useRef(null);

    const openModal = () => {
        modalRef.current.showModal();
    }

    const closeModal = () => {
        modalRef.current.close();
    }

    return (
        <><div className="flex flex-row">
            <p className="text-lg text-slate-600 mr-2">Próximo correlativo:</p>
            <p className="text-lg text-slate-600 mr-2">{invoiceNumber}</p>
            <button onClick={openModal} className="font-bold text-lg text-teal-500">Cambiar...</button>
        </div><dialog ref={modalRef}>
                <form onSubmit={handleSubmit} className="flex flex-col w-[300px]">
                    <h2 className="text-lg font-bold text-slate-600 mb-2">Cambiar próximo correlativo</h2>
                    <p className="text-sm font-bold text-slate-600 mb-2">Correlativo:</p>
                    <input type="number" value={invoiceNumber}
                        onChange={handleChange} className="w-[100px] border-b border-slate-800 outline-none" />
                    <div className="flex flex-row justify-end">
                        <button onClick={closeModal} className="text-slate-400 m-4">Cancelar</button>
                        <button type="submit" className="text-teal-500 font-bold">OK</button>
                    </div>
                </form>
            </dialog></>
    )
}

export default InvoiceNumber;
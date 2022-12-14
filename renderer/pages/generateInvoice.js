import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import InvoiceNumber from "../components/InvoiceNumber";
import Footer from "../components/Footer";
import Modal from 'react-modal';
import Link from "next/link";
import DownloadIcon from "../public/download.svg";
Modal.setAppElement("#__next");

const clLocale = Intl.NumberFormat("es-CL");

const GenerateInvoice = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [refresh, setRefresh] = useState(null);
    const [partners, setPartners] = useState(null);
    const [ufPrice, setUfPrice] = useState(null);

    const [currentPartnerInvoice, setCurrentPartnerInvoice] = useState(null);
    const [previousBalance, setPreviousBalance] = useState(0);

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const downloadPDF = (pdf, filename) => {
        const linkSource = `data:application/pdf;base64,${pdf}`;
        const downloadLink = document.createElement("a");

        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = await window.electron.invoice.generateInvoice(currentPartnerInvoice, previousBalance);
        downloadPDF(Buffer.from(data.buffer).toString('base64'), data.filename);
        setRefresh(data.number);
        setCurrentPartnerInvoice(null);
        setPreviousBalance(0);

        closeModal();
    }

    useEffect(() => {
        window.electron.partner.getAll().then((partners) => {
            setPartners(partners);
        });
        window.electron.general.getUfPrice().then((price) => {
            setUfPrice(price);
        });
    }, []);

    return (
        <>
            <Head>
                <title>Ópticas de Chile Invoice</title>
            </Head>
            <div className="w-full p-12 flex flex-row justify-between">
                <p className="text-2xl font-bold text-slate-600">
                    Generar Invoice
                </p>
                {ufPrice && (
                    <p className="text-sm text-slate-500 mb-2">Valor de UF el {ufPrice.date.toLocaleDateString('es-CL')}: ${clLocale.format(ufPrice.price)}</p>
                )}
            </div>
            <div className="w-full flex flex-row justify-between px-12 h-10 items-center">
                <InvoiceNumber refresh={refresh} />
                <div className="flex flex-row justify-between">
                    <Link href="/partners" className="text-teal-500 font-bold outline rounded-md p-2 mr-4">Administrar Socios</Link>
                    <Link href="/partnerLevels" className="text-teal-500 font-bold outline rounded-md p-2">Administrar Cuotas</Link>
                </div>
            </div>
            <div className="flex w-full justify-center px-12">
                <table className="w-full border-separate border-spacing-y-8">
                    <thead>
                        <tr className="text-left text-slate-600 border-b border-gray-200">
                            <th className="border-b-2 border-teal-500">Nombre</th>
                            <th className="border-b-2 border-teal-500">RUT</th>
                            <th className="border-b-2 border-teal-500">Dirección</th>
                            <th className="border-b-2 border-teal-500">Comuna</th>
                            <th className="border-b-2 border-teal-500">Cuota</th>
                            <th className="border-b-2 border-teal-500"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {partners && partners.map(partner => (
                            <tr key={partner._id}>
                                <td className="border-b border-gray-200">{partner.name}</td>
                                <td className="border-b border-gray-200">{partner.rut}</td>
                                <td className="border-b border-gray-200">{partner.address}</td>
                                <td className="border-b border-gray-200">{partner.commune.name}</td>
                                <td className="border-b border-gray-200">{partner.partnerLevel.name}</td>
                                <td className="border-b border-gray-200"><button onClick={() => {
                                    setCurrentPartnerInvoice(partner._id);
                                    openModal();
                                }} ><Image src={DownloadIcon} width="20" height="20" alt="descargar" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer />
            <Modal
                className="absolute w-2/5 p-8 rounded-lg after:bg-gray-700 ml-[30%] mt-36 z-50 bg-white border"
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
                style={{ overlay: { backgroundColor: "rgba(9, 9, 14, 0.6)" } }}
            >
                <form onSubmit={handleSubmit} className="flex flex-col w-[300px]">
                    <h2 className="text-lg font-bold text-slate-600 mb-2">Saldo Anterior</h2>
                    <p className="text-sm font-bold text-slate-600 mb-2">Saldo pendiente:</p>
                    <input type="number"
                        value={previousBalance}
                        onChange={(e) => setPreviousBalance(Number.parseInt(e.target.value))}
                        className="w-[100px] border-b border-slate-800 outline-none" />
                    <div className="flex flex-row justify-end">
                        <button onClick={closeModal} className="text-slate-400 m-4">Cancelar</button>
                        <button type="submit" className="text-teal-500 font-bold">OK</button>
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default GenerateInvoice;

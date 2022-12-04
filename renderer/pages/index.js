import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import data from "../data/partners";
import InvoiceNumber from "../components/InvoiceNumber";
import Modal from 'react-modal';
Modal.setAppElement("#__next");

const Home = () => {

    const [modalIsOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    return (
        <>
            <Head>
                <title>Invoice Ópticas de Chile</title>
            </Head>
            <div className="w-full justify-between items-center p-12">
                <p className="text-2xl font-bold text-slate-600 mb-6">
                    Generar Invoice
                </p>
                <InvoiceNumber />
            </div>
            <div className="flex w-full justify-center p-12">
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
                        {data.partners.map(partner => (
                            <tr>
                                <td className="border-b border-gray-200">{partner.name}</td>
                                <td className="border-b border-gray-200">{partner.rut}</td>
                                <td className="border-b border-gray-200">{partner.address}</td>
                                <td className="border-b border-gray-200">{partner.commune.name}</td>
                                <td className="border-b border-gray-200">{partner.subscription.name}</td>
                                <td className="border-b border-gray-200"><button onClick={openModal} ><Image src="/download.svg" width="20" height="20" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal
                className="absolute w-2/5 p-8 rounded-lg after:bg-gray-700 ml-[30%] mt-36 z-50 bg-white border"
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
                style={{ overlay: { backgroundColor: "rgba(9, 9, 14, 0.6)" } }}
            >
                <form className="flex flex-col w-[300px]">
                    <h2 className="text-lg font-bold text-slate-600 mb-2">Saldo Anterior</h2>
                    <p className="text-sm font-bold text-slate-600 mb-2">Saldo pendiente:</p>
                    <input type="number" 
                        className="w-[100px] border-b border-slate-800 outline-none" />
                    <div className="flex flex-row justify-end">
                        <button className="text-slate-400 m-4">Cancelar</button>
                        <button type="submit" className="text-teal-500 font-bold">OK</button>
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default Home;

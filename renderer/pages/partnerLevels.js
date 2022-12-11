import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import BackIcon from "../public/back.svg";
import EditIcon from "../public/edit.svg";
import TrashIcon from "../public/trash.svg";
import Modal from 'react-modal';
Modal.setAppElement("#__next");

const clLocale = Intl.NumberFormat("es-CL");

const PartnerLevels = () => {
    const [infoState, setInfoState] = useState("hidden");
    const [message, setMessage] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [levels, setLevels] = useState(null);

    const [name, setName] = useState(null);
    const [price, setPrice] = useState(null);

    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);

    const cleanState = () => {
        setShowForm(false);
        setName(null);
        setPrice(null);
    };

    const handleError = (error) => {
        setMessage(error.message.split('Error: ')[1]);
        setInfoState("inline-block");
        setTimeout(() => {
            setInfoState("hidden");
        }, 3000);
    };

    const addPartnerLevel = (e) => {
        e.preventDefault();

        window.electron.partnerLevel.new({
            name,
            price: Number.parseFloat(price),
        }).then(() => {
            cleanState();
            refreshLevels();
        }).catch((error) => {
            handleError(error);
        });
    };

    const refreshLevels = () => {
        window.electron.partnerLevel.getAll().then((levels) => {
            setLevels(levels);
        });
    };

    useEffect(() => {
        refreshLevels();
    }, []);

    const closedNewPartnerForm = (
        <div
            className="w-[850px] my-5 p-5 rounded-lg border border-gray-500 self-center cursor-pointer"
            onClick={() => setShowForm(true)}
        >
            <p className="text-lg text-teal-500 font-bold text-center">Agregar Cuota</p>
        </div>
    );

    const handleEditButton = (level) => {
        setSelectedLevel(level);
        openModal();
    }

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        cleanState();
        setIsOpen(false);
    }

    const handleEdit = (e) => {
        e.preventDefault();

        window.electron.partnerLevel.update(selectedLevel._id, {
            name: name || selectedLevel.name,
            price: price ? Number.parseFloat(price) : selectedLevel.price,
        }).then(() => {
            cleanState();
            closeModal();
            refreshLevels();
        }).catch((error) => {
            handleError(error);
        });
    }

    return (
        <>
            <Head>
                <title>Administrar cuotas</title>
            </Head>
            <div className="w-full px-10 mt-6">
                <Link href="/generateInvoice" className="text-lg text-teal-500 font-bold"><Image src={BackIcon} alt="volver" width="35" height="35"></Image></Link>
                <div className="flex justify-center">
                    {showForm ? <div className="flex flex-col justify-center">
                        <form className="w-[850px] my-5 p-5 rounded-lg border border-gray-500 self-center">
                            <p className="text-lg text-teal-500 font-bold text-center mb-6">Agregar Cuota</p>
                            <div className="w-full flex flex-row justify-between">
                                <label className="text-slate-600 w-[48%]">
                                    Nombre:<input onChange={(e) => setName(e.target.value)} value={name} type="text"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                                <label className="text-slate-600 w-[48%]">
                                    Precio:<input onChange={(e) => setPrice(e.target.value)} value={price} type="number" step="0.01"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                            </div>
                            <div className="w-full flex flex-row justify-between">
                            </div>
                            <div className="flex flex-row justify-end mt-4">
                                <button onClick={cleanState} className="text-slate-400 mx-4 my-2">
                                    Cancelar
                                </button>
                                <button type="submit" onClick={addPartnerLevel} className="text-teal-500 font-bold outline rounded-lg px-2">
                                    Agregar
                                </button>
                            </div>
                        </form>
                        <div></div>
                    </div> : closedNewPartnerForm}
                </div>
            </div>
            <div className="flex w-full justify-center p-12 pt-0">
                <table className="w-full border-separate border-spacing-y-8">
                    <thead>
                        <tr className="text-left text-slate-600 border-b border-gray-200">
                            <th className="border-b-2 border-teal-500">Nombre</th>
                            <th className="border-b-2 border-teal-500">Precio (UF)</th>
                            <th className="border-b-2 border-teal-500"></th>
                            <th className="border-b-2 border-teal-500"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {levels && levels.map(level => (
                            <tr key={level._id}>
                                <td className="border-b border-gray-200">{level.name}</td>
                                <td className="border-b border-gray-200">{clLocale.format(level.price)}</td>
                                <td className="border-b border-gray-200"><button><Image src={EditIcon} width="20" height="20" alt="editar" className="mx-4" onClick={() => handleEditButton(level)} /></button></td>
                                <td className="border-b border-gray-200"><button onClick={() => {
                                    if (confirm(`Confirmar eliminación:\n${level.name}`)) {
                                        window.electron.partnerLevel.delete(level._id).then(() => {
                                            setLevels(levels.filter(lvl => lvl._id !== level._id))
                                        }).catch((error) => {
                                            handleError(error);
                                        });
                                    }
                                }}><Image src={TrashIcon} width="20" height="20" alt="eliminar" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div
                className={`fixed right-10 bottom-10 z-50 ${infoState} border-r-8 border-red-600 bg-white px-5 py-4 drop-shadow-lg`}
            >
                <p className="text-sm">
                    <span className="mr-2 inline-block rounded-full bg-red-600 px-3 py-1 font-extrabold text-white">
                        !
                    </span>
                    {message}
                </p>
            </div>
            <Modal
                className="absolute rounded-lg after:bg-gray-700 ml-[30%] mt-36 z-50 bg-zinc-100"
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Level Modal"
                style={{ overlay: { backgroundColor: "rgba(9, 9, 14, 0.6)" } }}
            >
                <div className="flex flex-col justify-center">
                    <div className="flex flex-col justify-center">
                        <form onSubmit={handleEdit} className="w-[450px] my-5 p-7 rounded-lg self-center">
                            <p className="text-lg text-teal-500 font-bold text-center mb-6">Editar Cuota</p>
                            <div className="w-full flex flex-row justify-between">
                                <label className="text-slate-600 w-[48%]">
                                    Nombre:<input onChange={(e) => setName(e.target.value)} defaultValue={selectedLevel?.name || ""} type="text"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                                <label className="text-slate-600 w-[48%]">
                                    Precio:<input onChange={(e) => setPrice(e.target.value)} defaultValue={selectedLevel?.price || ""} type="number"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                            </div>
                            <div className="w-full flex flex-row justify-between">
                            </div>
                            <div className="flex flex-row justify-end mt-4">
                                <button onClick={closeModal} className="text-slate-400 mx-4 my-2">
                                    Cancelar
                                </button>
                                <button type="submit" className="text-teal-500 font-bold outline rounded-lg px-2">
                                    Confirmar
                                </button>
                            </div>
                        </form>
                        <div></div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default PartnerLevels;

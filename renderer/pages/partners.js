import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import BackIcon from "../public/back.svg";
import EditIcon from "../public/edit.svg";
import TrashIcon from "../public/trash.svg";
import Modal from 'react-modal';
Modal.setAppElement("#__next");

const Partners = () => {
    const [infoState, setInfoState] = useState("hidden");
    const [message, setMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [partners, setPartners] = useState(null);
    const [levels, setLevels] = useState(null);
    const [regions, setRegions] = useState(null);
    const [communes, setCommunes] = useState(null);

    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedCommune, setSelectedCommune] = useState(null);
    const [name, setName] = useState(null);
    const [address, setAddress] = useState(null);
    const [rut, setRut] = useState(null);

    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    const cleanState = () => {
        setShowForm(false);
        setName(null);
        setAddress(null);
        setRut(null);
        setSelectedLevel(null);
        setSelectedCommune(null);
        setCommunes(null);
    };

    const handleError = (error) => {
        setMessage(error.message.split('Error: ')[1]);
        setInfoState("inline-block");
        setTimeout(() => {
            setInfoState("hidden");
        }, 3000);
    };

    const getLocationData = (regionId) => {
        window.electron.general.getLocationData(regionId).then((data) => {
            if (regionId) {
                setCommunes(data.communes);
            } else {
                setRegions(data.regions);
            }
        });
    };

    const addPartner = (e) => {
        e.preventDefault();

        window.electron.partner.new({
            name,
            address,
            rut,
            communeId: selectedCommune,
            levelId: selectedLevel,
        }).then(() => {
            cleanState();
        }).catch((error) => {
            handleError(error);
        });
    };

    const regionChange = (e) => {
        setSelectedCommune(null);
        setCommunes(null);
        getLocationData(e.target.value);
    };

    const fetchPartners = () => {
        window.electron.partner.getAll().then((partners) => {
            setPartners(partners);
        });
    };

    useEffect(() => {
        getLocationData();
        window.electron.partnerLevel.getAll().then((levels) => {
            setLevels(levels);
        });
        fetchPartners();
    }, []);

    const closedNewPartnerForm = (
        <div
            className="w-[850px] my-5 p-5 rounded-lg border border-gray-500 self-center cursor-pointer"
            onClick={() => setShowForm(true)}
        >
            <p className="text-lg text-teal-500 font-bold text-center">Agregar Socio</p>
        </div>
    );

    const handleEditButton = (partner) => {
        setSelectedPartner(partner);
        regionChange({ target: { value: partner.commune.regionId } });
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
        window.electron.partner.update(selectedPartner._id, {
            name: name || selectedPartner.name,
            address: address || selectedPartner.address,
            rut: rut || selectedPartner.rut,
            communeId: selectedCommune || selectedPartner.communeId,
            levelId: selectedLevel || selectedPartner.levelId,
        }).then(() => {
            cleanState();
            closeModal();
            fetchPartners();
        }).catch((error) => {
            handleError(error);
        });
    }

    return (
        <>
            <Head>
                <title>Administrar socios</title>
            </Head>
            <div className="w-full px-10 mt-6">
                <Link href="/generateInvoice" className="text-lg text-teal-500 font-bold"><Image src={BackIcon} alt="volver" width="35" height="35"></Image></Link>
                <div className="flex justify-center">
                    {showForm ? <div className="flex flex-col justify-center">
                        <form className="w-[850px] my-5 p-5 rounded-lg border border-gray-500 self-center">
                            <p className="text-lg text-teal-500 font-bold text-center mb-6">Agregar Socio</p>
                            <div className="w-full flex flex-row justify-between">
                                <label className="text-slate-600 w-[48%]">
                                    Nombre:<input onChange={(e) => setName(e.target.value)} value={name} type="text"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                                <label className="text-slate-600 w-[48%]">
                                    Direcci??n:<input onChange={(e) => setAddress(e.target.value)} value={address} type="text"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                            </div>
                            <div className="w-full flex flex-row justify-between">
                                <label className="text-slate-600 w-[22%]">
                                    RUT:<input onChange={(e) => setRut(e.target.value)} value={rut} type="text"
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                    />
                                </label>
                                <label className="text-slate-600 w-[22%]">
                                    Cuota:<select
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        value={selectedLevel}
                                        className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2">
                                        <option value="">Seleccionar...</option>
                                        {levels && levels.map((option) => (
                                            <option key={option._id} value={option._id}>{option.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="text-slate-600 w-[22%]">Regi??n:<select
                                    onChange={regionChange}
                                    className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2">
                                    <option value="">Seleccionar...</option>
                                    {regions && regions.map((option) => (
                                        <option key={option._id} value={option._id}>{option.name}</option>
                                    ))}
                                </select>
                                </label>
                                <label className="text-slate-600 w-[22%]">Comuna:<select
                                    onChange={(e) => setSelectedCommune(e.target.value)}
                                    value={selectedCommune}
                                    className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2">
                                    {!communes ? <option value="">Seleccione regi??n</option> : <option value="">Seleccionar...</option>}
                                    {communes && communes.map((option) => (
                                        <option key={option._id} value={option._id}>{option.name}</option>
                                    ))}
                                </select>
                                </label>
                            </div>
                            <div className="w-full flex flex-row justify-between">
                            </div>
                            <div className="flex flex-row justify-end mt-4">
                                <button onClick={cleanState} className="text-slate-400 mx-4 my-2">
                                    Cancelar
                                </button>
                                <button type="submit" onClick={addPartner} className="text-teal-500 font-bold outline rounded-lg px-2">
                                    Agregar
                                </button>
                            </div>
                        </form>
                    </div> : closedNewPartnerForm}
                </div>
            </div>
            <div className="flex w-full justify-center px-12 pt-0">
                <table className="w-full border-separate border-spacing-y-8">
                    <thead>
                        <tr className="text-left text-slate-600 border-b border-gray-200">
                            <th className="border-b-2 border-teal-500">Nombre</th>
                            <th className="border-b-2 border-teal-500">RUT</th>
                            <th className="border-b-2 border-teal-500">Direcci??n</th>
                            <th className="border-b-2 border-teal-500">Comuna</th>
                            <th className="border-b-2 border-teal-500">Cuota</th>
                            <th className="border-b-2 border-teal-500"></th>
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
                                <td className="border-b border-gray-200"><button><Image src={EditIcon} width="20" height="20" alt="editar" className="mx-4" onClick={() => handleEditButton(partner)} /></button></td>
                                <td className="border-b border-gray-200"><button onClick={() => {
                                    if (confirm(`Confirmar eliminaci??n:\n${partner.name}`)) {
                                        window.electron.partner.delete(partner._id).then(() => {
                                            setPartners(partners.filter(p => p._id !== partner._id))
                                        })
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
            <Footer />
            <Modal
                className="absolute rounded-lg after:bg-gray-700 ml-[8%] mt-36 z-50 bg-zinc-100"
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Partner Modal"
                style={{ overlay: { backgroundColor: "rgba(9, 9, 14, 0.6)" } }}
            >
                <div className="flex flex-col justify-center">
                    <form onSubmit={handleEdit} className="w-[850px] my-5 p-6 rounded-lg self-center">
                        <p className="text-lg text-teal-500 font-bold text-center mb-6">Editar Informaci??n Socio</p>
                        <div className="w-full flex flex-row justify-between">
                            <label className="text-slate-600 w-[48%]">
                                Nombre:<input onChange={(e) => setName(e.target.value)} defaultValue={selectedPartner?.name || ""} type="text"
                                    className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                />
                            </label>
                            <label className="text-slate-600 w-[48%]">
                                Direcci??n:<input onChange={(e) => setAddress(e.target.value)} defaultValue={selectedPartner?.address || ""} type="text"
                                    className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                />
                            </label>
                        </div>
                        <div className="w-full flex flex-row justify-between">
                            <label className="text-slate-600 w-[22%]">
                                RUT:<input onChange={(e) => setRut(e.target.value)} defaultValue={selectedPartner?.rut || ""} type="text"
                                    className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2 px-2"
                                />
                            </label>
                            <label className="text-slate-600 w-[22%]">
                                Cuota:<select
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    defaultValue={selectedLevel}
                                    className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2">
                                    <option value="">Seleccionar...</option>
                                    {levels && levels.map((option) => (
                                        <option key={option._id} value={option._id} selected={option._id === selectedPartner?.levelId}>{option.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-slate-600 w-[22%]">Regi??n:<select
                                onChange={regionChange}
                                className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2">
                                <option value="">Seleccionar...</option>
                                {regions && regions.map((option) => (
                                    <option key={option._id} value={option._id} selected={option._id === selectedPartner?.commune.regionId}>{option.name}</option>
                                ))}
                            </select>
                            </label>
                            <label className="text-slate-600 w-[22%]">Comuna:<select
                                onChange={(e) => setSelectedCommune(e.target.value)}
                                defaultValue={selectedCommune}
                                className="border bg-transparent w-full outline-slate-600 text-slate-600 my-2">
                                {!communes ? <option value="">Seleccione regi??n</option> : <option value="">Seleccionar...</option>}
                                {communes && communes.map((option) => (
                                    <option key={option._id} value={option._id} selected={option._id === selectedPartner?.communeId}>{option.name}</option>
                                ))}
                            </select>
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
                </div>
            </Modal>
        </>
    )
}

export default Partners;
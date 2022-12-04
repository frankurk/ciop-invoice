import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import data from "../data/partners";

const Home = () => {

    return (
        <>
            <Head>
                <title>Invoice Ópticas de Chile</title>
            </Head>
            <div className="w-full justify-between items-center p-12">
                <p className="text-2xl font-bold text-slate-600 mb-6">
                    Generar Invoice
                </p>
                <div className="flex flex-row">
                    <p className="text-lg font-bold text-slate-600 mr-2">Próximo correlativo:</p>
                    <p className="text-lg text-slate-600 mr-2">789</p>
                    <p className="text-sm text-teal-500">Cambiar...</p>
                </div>
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
                                <td className="border-b border-gray-200"><button><Image src="/download.svg" width="20" height="20" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Home;

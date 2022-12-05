import { useState, useEffect } from "react";
import Modal from "react-modal";
Modal.setAppElement("#__next");

const InvoiceNumber = ({refresh}) => {
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    setNewInvoiceNumber(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await window.electron.invoice.setCorrelative(newInvoiceNumber);
    setInvoiceNumber(newInvoiceNumber);
    closeModal();
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    window.electron.invoice.getCorrelative().then((data) => {
      setInvoiceNumber(data);
      setNewInvoiceNumber(data);
    });
  }, [refresh]);

  return (
    <>
      <div className="flex flex-row">
        <p className="text-lg text-slate-600 mr-2">Próximo correlativo:</p>
        <p className="text-lg text-slate-600 mr-2">{invoiceNumber}</p>
        <button onClick={openModal} className="font-bold text-lg text-teal-500">
          Cambiar...
        </button>
      </div>
      <Modal
        className="absolute w-2/5 p-8 rounded-lg after:bg-gray-700 ml-[30%] mt-36 z-50 bg-white border"
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={{ overlay: { backgroundColor: "rgba(9, 9, 14, 0.6)" } }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col w-[300px]">
          <h2 className="text-lg font-bold text-slate-600 mb-2">
            Cambiar próximo correlativo
          </h2>
          <p className="text-sm font-bold text-slate-600 mb-2">Correlativo:</p>
          <input
            type="number"
            value={newInvoiceNumber}
            onChange={handleChange}
            className="w-[100px] border-b border-slate-800 outline-none"
          />
          <div className="flex flex-row justify-end">
            <button onClick={closeModal} className="text-slate-400 m-4">
              Cancelar
            </button>
            <button type="submit" className="text-teal-500 font-bold">
              OK
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default InvoiceNumber;

/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search as SearchIcon,
  Banknote,
  Landmark,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Database,
  CreditCard,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import PageWrapper from "../../../../components/PageWrapper";
import Pagination from "../../../../components/Pagination";
import Dropdown from "../../../../components/Dropdown";
import Label from "../../../../components/Label";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ReadFinance = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("fin_search") || "",
  );
  const [filterBank, setFilterBank] = useState(
    localStorage.getItem("fin_bank") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("fin_page")) || 1,
  );

  const [finance, setFinance] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("fin_search", searchTerm);
    localStorage.setItem("fin_bank", filterBank);
    localStorage.setItem("fin_page", currentPage);
  }, [searchTerm, filterBank, currentPage]);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/finance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFinance(res.data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Gagal sinkronisasi data finance" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "HAPUS SUMBER DANA?",
      text: `Akun ${name} akan dihapus permanen dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "YA, HAPUS",
      cancelButtonText: "BATAL",
      customClass: {
        popup: "rounded-[2rem]",
        confirmButton: "rounded-full px-6 py-3 font-black text-[10px]",
        cancelButton: "rounded-full px-6 py-3 font-black text-[10px]",
      },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/finance/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast.fire({ icon: "success", title: "Data berhasil dihapus" });
        fetchFinance();
      } catch (err) {
        Toast.fire({ icon: "error", title: "Gagal menghapus data" });
      }
    }
  };

  const filteredData = finance
    .filter((f) => {
      const matchSearch =
        f.nama_akun?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.nomor_rekening?.includes(searchTerm);
      const matchBank = filterBank === "all" || f.bank === filterBank;
      return matchSearch && matchBank;
    })
    .sort((a, b) => b.id_finance - a.id_finance);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const tableColumns = [
    {
      header: "NO",
      align: "text-left pl-8 w-[70px]",
      render: (_, i) => (
        <span className="text-[10px] font-mono font-bold text-gray-400">
          {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "IDENTITAS AKUN",
      align: "text-left w-[35%]",
      render: (row) => (
        <div className="flex flex-col py-3.5">
          <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight">
            {row.nama_akun}
          </span>
          <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest italic">
            DESC: {row.keterangan || "INTERNAL MDR"}
          </span>
        </div>
      ),
    },
    {
      header: "INSTITUSI BANK",
      align: "text-left w-[20%]",
      render: (row) => (
        <div className="flex items-center gap-2 py-3.5">
          <div className="p-2 bg-blue-50 rounded-lg text-[#1E5AA5]">
            <Landmark size={14} />
          </div>
          <span className="text-[11px] font-black text-gray-700 uppercase">
            {row.bank}
          </span>
        </div>
      ),
    },
    {
      header: "NOMOR REKENING",
      align: "text-left w-[20%]",
      render: (row) => (
        <span className="text-[11px] font-mono font-bold text-gray-600 tracking-wider">
          {row.nomor_rekening}
        </span>
      ),
    },
    {
      header: "KONTROL",
      align: "text-center w-[150px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            icon={<Edit3 size={15} />}
            onClick={() => navigate(`/admin/finance/edit/${row.id_finance}`)}
            className="!p-2.5 !bg-transparent !text-gray-400 hover:!text-[#1E5AA5] !shadow-none hover:bg-blue-50 !rounded-xl transition-all"
          />
          <Button
            icon={<Trash2 size={15} />}
            onClick={() => handleDelete(row.id_finance, row.nama_akun)}
            className="!p-2.5 !bg-transparent !text-gray-400 hover:!text-rose-500 !shadow-none hover:bg-rose-50 !rounded-xl transition-all"
          />
        </div>
      ),
    },
  ];

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0 font-poppins">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-10 pt-10 pb-6">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-[2.5rem] shadow-2xl bg-white overflow-hidden border-none">
          <div className="px-10 pt-8 pb-6 shrink-0">
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-[#1E5AA5] to-[#114086] rounded-2xl text-white shadow-xl shadow-blue-900/20">
                  <Banknote size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="MDR Financial Core System"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase tracking-[0.1em]"
                  />
                  <h1 className="text-xl font-[900] text-gray-800 uppercase leading-none tracking-tighter">
                    Manajemen <span className="text-[#2E5AA7]">Finance</span>
                  </h1>
                </div>
              </div>
              <Button
                text="TAMBAH SUMBER DANA"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/finance/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95 transition-all uppercase tracking-widest"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama akun atau nomor rekening..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[11px] font-bold"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
              </div>
              <div className="w-52">
                <Dropdown
                  icon={Landmark}
                  value={filterBank}
                  items={[
                    { value: "all", label: "SEMUA BANK" },
                    { value: "Permata", label: "BANK PERMATA" },
                    { value: "BCA", label: "BCA" },
                    { value: "Mandiri", label: "MANDIRI" },
                    { value: "BNI", label: "BNI" },
                  ]}
                  onChange={(v) => {
                    setFilterBank(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit">
                <Filter size={12} className="inline mr-2" /> Hasil: {totalItems}{" "}
                Akun Terdaftar
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBank("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <div className="flex-none px-10 pb-4 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-collapse"
              />
              {!loading && currentData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-gray-900">
                  <Database size={40} className="mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">
                    Data Tidak Ditemukan
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-10 py-5 mt-auto border-t border-gray-100 bg-gray-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
};

export default ReadFinance;

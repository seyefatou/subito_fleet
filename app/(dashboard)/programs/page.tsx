// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Landmark, Edit2, MoreVertical, Eye } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Données mock
const mockPrograms: any[] = [];
const mockBanks: any[] = [];

export default function Programs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const programs = mockPrograms;
  const banks = mockBanks;

  const getBank = (id) => banks.find(b => b.id === id);

  const openModal = (program = null) => {
    setEditingProgram(program);
    setFormData(program || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProgram(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingProgram ? 'Programme mis à jour' : 'Programme créé');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Programme',
      render: (program) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <Link href={`/programs/${program.id}`} className="text-blue-600 hover:underline font-semibold">{program.name}</Link>
            <p className="text-xs text-slate-500">{program.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Banque',
      render: (program) => {
        const bank = getBank(program.bank_id);
        return bank ? (
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span>{bank.name}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Durée',
      render: (program) => (
        <span>{program.duration_months} mois</span>
      )
    },
    {
      header: 'Taux',
      render: (program) => (
        <span>{program.interest_rate}%</span>
      )
    },
    {
      header: 'Montant max',
      render: (program) => (
        <span className="font-semibold">
          {program.max_amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (program) => <StatusBadge status={program.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (program) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/programs/${program.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(program)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Programmes"
        subtitle="Gestion des programmes de financement"
        action={() => openModal()}
        actionLabel="Ajouter un programme"
      />

      <DataTable
        columns={columns}
        data={programs}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un programme..."
        emptyMessage="Aucun programme enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingProgram ? 'Modifier le programme' : 'Nouveau programme'}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nom"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
          />
          <FormField
            label="Banque"
            name="bank_id"
            type="select"
            value={formData.bank_id}
            onChange={handleChange}
            options={banks.map(b => ({ value: b.id, label: b.name }))}
          />
          <FormField
            label="Durée (mois)"
            name="duration_months"
            type="number"
            value={formData.duration_months}
            onChange={handleChange}
          />
          <FormField
            label="Taux d'intérêt (%)"
            name="interest_rate"
            type="number"
            value={formData.interest_rate}
            onChange={handleChange}
          />
          <FormField
            label="Montant maximum"
            name="max_amount"
            type="number"
            value={formData.max_amount}
            onChange={handleChange}
          />
        </div>
        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </FormModal>
    </div>
  );
}

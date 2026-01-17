// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Landmark, Edit2, MoreVertical, Eye, Loader2, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import programsService from '@/api/services/programs.service';
import banksService from '@/api/services/banks.service';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'SUSPENDED', label: 'Suspendu' },
];

export default function Programs() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({});

  // Filtres
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBankId, setFilterBankId] = useState<string>('');

  // Récupérer les programmes avec filtres
  const { data: programsData, isLoading } = useQuery({
    queryKey: ['programs', filterStatus, filterBankId],
    queryFn: () => programsService.list({
      status: filterStatus || undefined,
      bankId: filterBankId || undefined
    }),
  });

  // Récupérer les banques pour le select
  const { data: banksData } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  const programs = programsData?.data || [];
  const banks = banksData?.data || [];

  const hasFilters = filterStatus || filterBankId;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterBankId('');
  };

  // Mutation pour créer/modifier un programme
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (editingProgram) {
        return programsService.update(editingProgram.id, data);
      }
      return programsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(editingProgram ? 'Programme mis à jour' : 'Programme créé');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Une erreur est survenue');
    },
  });

  const getBank = (id) => banks.find(b => b.id === id);

  const openModal = (program = null) => {
    setEditingProgram(program);
    setFormData(program || { status: 'ACTIVE' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProgram(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    mutation.mutate(formData);
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
            <p className="text-xs text-slate-500">{program.description || '-'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Banque',
      render: (program) => {
        const bank = program.banks || getBank(program.bank_id);
        return bank ? (
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span>{bank.name}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Véhicules',
      render: (program) => (
        <span>{program.vehicle_count || 0}</span>
      )
    },
    {
      header: 'Financement',
      render: (program) => (
        <span className="font-semibold">
          {program.total_financed?.toLocaleString('fr-FR') || 0} F
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

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtres</span>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterBankId} onValueChange={setFilterBankId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les banques" />
            </SelectTrigger>
            <SelectContent>
              {banks.map(bank => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

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
        isLoading={mutation.isPending}
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
            label="Banque"
            name="bankId"
            type="select"
            value={formData.bankId}
            onChange={handleChange}
            options={banks.map(b => ({ value: b.id, label: b.name }))}
          />
          <FormField
            label="Date de début"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
          />
          <FormField
            label="Date de fin"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
          />
          <FormField
            label="Financement total (F)"
            name="totalFinanced"
            type="number"
            value={formData.totalFinanced}
            onChange={handleChange}
          />
          <FormField
            label="Nombre de véhicules"
            name="vehicleCount"
            type="number"
            value={formData.vehicleCount}
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

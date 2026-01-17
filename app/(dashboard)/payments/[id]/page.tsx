// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CreditCard, User, Car, Landmark, Calendar, Receipt, FileText,
  ArrowLeft, Edit2, CheckCircle, Clock, AlertTriangle, Loader2, Send,
  Trash2, Plus, Check, X, Image, ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import StatusBadge from '@/components/common/StatusBadge';
import paymentsService from '@/api/services/payments.service';
import { toast } from 'sonner';

const paymentMethods = [
  { value: 'CASH', label: 'Especes' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CHECK', label: 'Cheque' },
];

export default function PaymentDetails() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // States for modals
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showAddProofModal, setShowAddProofModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);

  // Form states
  const [markPaidForm, setMarkPaidForm] = useState({
    paidAmount: '',
    paymentMethod: '',
    transactionId: '',
    notes: '',
  });

  const [proofForm, setProofForm] = useState({
    fileUrl: '',
    fileName: '',
    fileType: '',
    notes: '',
  });

  // Query
  const { data: paymentData, isLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsService.get(id),
    enabled: !!id,
  });

  // Mutations
  const markAsPaidMutation = useMutation({
    mutationFn: (data: any) => paymentsService.markAsPaid(id, data),
    onSuccess: () => {
      toast.success('Paiement marque comme paye');
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      setShowMarkPaidModal(false);
      setMarkPaidForm({ paidAmount: '', paymentMethod: '', transactionId: '', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise a jour');
    },
  });

  const routeToBankMutation = useMutation({
    mutationFn: () => paymentsService.routeToBank(id),
    onSuccess: () => {
      toast.success('Paiement route vers la banque');
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      setShowRouteDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du routage');
    },
  });

  const addProofMutation = useMutation({
    mutationFn: (data: any) => paymentsService.addProof(id, data),
    onSuccess: () => {
      toast.success('Preuve de paiement ajoutee');
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      setShowAddProofModal(false);
      setProofForm({ fileUrl: '', fileName: '', fileType: '', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout');
    },
  });

  const verifyProofMutation = useMutation({
    mutationFn: (proofId: string) => paymentsService.verifyProof(proofId),
    onSuccess: () => {
      toast.success('Preuve verifiee avec succes');
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la verification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => paymentsService.delete(id),
    onSuccess: () => {
      toast.success('Paiement supprime');
      router.push('/payments');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const payment = paymentData?.data || paymentData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Paiement non trouve</p>
        {error && <p className="text-red-500 text-sm mt-2">{(error as any).message}</p>}
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const vehicle = payment.vehicle || payment.vehicles;
  const driver = payment.driver || payment.drivers;
  const bank = payment.bank || payment.banks;
  const proofs = payment.paymentProofs || payment.payment_proofs || [];
  const isRouted = payment.routedToBank || payment.routed_to_bank;
  const isPaid = payment.status === 'PAID';
  const dueAmount = payment.dueAmount || payment.due_amount || 0;
  const paidAmount = payment.paidAmount || payment.paid_amount || 0;

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Especes',
    MOBILE_MONEY: 'Mobile Money',
    WAVE: 'Wave',
    ORANGE_MONEY: 'Orange Money',
    BANK_TRANSFER: 'Virement bancaire',
    CHECK: 'Cheque',
  };

  const handleMarkAsPaid = () => {
    markAsPaidMutation.mutate({
      paidAmount: markPaidForm.paidAmount ? parseFloat(markPaidForm.paidAmount) : undefined,
      paymentMethod: markPaidForm.paymentMethod,
      transactionId: markPaidForm.transactionId || undefined,
      notes: markPaidForm.notes || undefined,
    });
  };

  const handleAddProof = () => {
    if (!proofForm.fileUrl) {
      toast.error('URL du fichier requise');
      return;
    }
    addProofMutation.mutate({
      fileUrl: proofForm.fileUrl,
      fileName: proofForm.fileName || undefined,
      fileType: proofForm.fileType || undefined,
      notes: proofForm.notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Details du paiement</h1>
            <p className="text-slate-500">Informations completes du paiement</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isPaid && (
            <Button onClick={() => setShowMarkPaidModal(true)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer paye
            </Button>
          )}
          {isPaid && !isRouted && (
            <Button onClick={() => setShowRouteDialog(true)} variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <Send className="w-4 h-4 mr-2" />
              Router banque
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowAddProofModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter preuve
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Profil principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {paidAmount.toLocaleString('fr-FR')} F
                </h2>
                <StatusBadge status={payment.status} />
                {isRouted && (
                  <Badge className="bg-blue-100 text-blue-700">Route</Badge>
                )}
              </div>
              <p className="text-slate-500 mb-4">
                Paiement du {format(new Date(payment.paymentDate || payment.payment_date), 'dd MMMM yyyy', { locale: fr })}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Montant du</p>
                  <p className="font-medium text-amber-600">
                    {dueAmount.toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Montant paye</p>
                  <p className="font-medium text-green-600">
                    {paidAmount.toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reste a payer</p>
                  <p className={`font-medium ${dueAmount - paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.max(0, dueAmount - paidAmount).toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Methode</p>
                  <p className="font-medium">
                    {paymentMethodLabels[payment.paymentMethod || payment.payment_method] || '-'}
                  </p>
                </div>
              </div>

              {(payment.transactionId || payment.transaction_id) && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Transaction ID</p>
                  <p className="font-mono text-sm">{payment.transactionId || payment.transaction_id}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle ? (
              <Link href={`/vehicles/${vehicle.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{vehicle.registrationNumber || vehicle.registration_number}</p>
                <p className="text-slate-500">{vehicle.brand} {vehicle.model}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non defini</p>
            )}
          </CardContent>
        </Card>

        {/* Chauffeur */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4" />
              Chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driver ? (
              <Link href={`/drivers/${driver.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">
                  {driver.first_name || driver.firstName} {driver.last_name || driver.lastName}
                </p>
                <p className="text-slate-500">{driver.phone || '-'}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non defini</p>
            )}
          </CardContent>
        </Card>

        {/* Banque */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Banque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bank ? (
              <Link href={`/banks/${bank.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{bank.name}</p>
                <p className="text-slate-500">{bank.code || '-'}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non definie</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statut et routage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={isRouted ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isRouted ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                <Send className={`w-6 h-6 ${isRouted ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  {isRouted ? 'Route vers la banque' : 'En attente de routage'}
                </p>
                {(payment.routedAt || payment.routed_at) && (
                  <p className="text-sm text-slate-500">
                    Le {format(new Date(payment.routedAt || payment.routed_at), 'dd/MM/yyyy a HH:mm', { locale: fr })}
                  </p>
                )}
              </div>
              {isPaid && !isRouted && (
                <Button size="sm" onClick={() => setShowRouteDialog(true)}>
                  Router
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Date de creation</p>
                <p className="text-sm text-slate-500">
                  {format(new Date(payment.createdAt || payment.created_at), 'dd MMMM yyyy a HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {payment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{payment.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Preuves de paiement */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-500" />
              Preuves de paiement ({proofs.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddProofModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {proofs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Aucune preuve de paiement</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddProofModal(true)}>
                Ajouter une preuve
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proofs.map((proof: any) => (
                <div key={proof.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{proof.fileName || proof.file_name || 'Document'}</p>
                        <p className="text-xs text-slate-500">{proof.fileType || proof.file_type || 'Fichier'}</p>
                      </div>
                    </div>
                    {(proof.verified) ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="w-3 h-3 mr-1" />
                        Verifie
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        En attente
                      </Badge>
                    )}
                  </div>

                  {proof.notes && (
                    <p className="text-sm text-slate-500 mb-3">{proof.notes}</p>
                  )}

                  {(proof.verifiedAt || proof.verified_at) && (
                    <p className="text-xs text-slate-400 mb-3">
                      Verifie le {format(new Date(proof.verifiedAt || proof.verified_at), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={proof.fileUrl || proof.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </a>
                    {!proof.verified && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => verifyProofMutation.mutate(proof.id)}
                        disabled={verifyProofMutation.isPending}
                      >
                        {verifyProofMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Verifier
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Marquer comme paye */}
      <Dialog open={showMarkPaidModal} onOpenChange={setShowMarkPaidModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme paye</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Montant paye</label>
              <Input
                type="number"
                placeholder={`Montant du: ${dueAmount} F`}
                value={markPaidForm.paidAmount}
                onChange={(e) => setMarkPaidForm({ ...markPaidForm, paidAmount: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">Laissez vide pour payer le montant total</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Methode de paiement *</label>
              <Select
                value={markPaidForm.paymentMethod || undefined}
                onValueChange={(value) => setMarkPaidForm({ ...markPaidForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une methode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">ID Transaction</label>
              <Input
                placeholder="Numero de transaction"
                value={markPaidForm.transactionId}
                onChange={(e) => setMarkPaidForm({ ...markPaidForm, transactionId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <Textarea
                placeholder="Notes optionnelles"
                value={markPaidForm.notes}
                onChange={(e) => setMarkPaidForm({ ...markPaidForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkPaidModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={!markPaidForm.paymentMethod || markAsPaidMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {markAsPaidMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajouter preuve */}
      <Dialog open={showAddProofModal} onOpenChange={setShowAddProofModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une preuve de paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700">URL du fichier *</label>
              <Input
                placeholder="https://example.com/receipt.pdf"
                value={proofForm.fileUrl}
                onChange={(e) => setProofForm({ ...proofForm, fileUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nom du fichier</label>
              <Input
                placeholder="recu_paiement.pdf"
                value={proofForm.fileName}
                onChange={(e) => setProofForm({ ...proofForm, fileName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Type de fichier</label>
              <Select
                value={proofForm.fileType || undefined}
                onValueChange={(value) => setProofForm({ ...proofForm, fileType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="receipt">Recu</SelectItem>
                  <SelectItem value="screenshot">Capture d'ecran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <Textarea
                placeholder="Description de la preuve"
                value={proofForm.notes}
                onChange={(e) => setProofForm({ ...proofForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProofModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddProof}
              disabled={!proofForm.fileUrl || addProofMutation.isPending}
            >
              {addProofMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation routage */}
      <AlertDialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Router vers la banque?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce paiement sera marque comme route vers la banque. Cette action confirme que les fonds ont ete transmis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => routeToBankMutation.mutate()}
              disabled={routeToBankMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {routeToBankMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce paiement?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Le paiement et toutes ses preuves associees seront definitivement supprimes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

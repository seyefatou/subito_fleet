// @ts-nocheck
"use client";

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileCheck, Check, X, Clock, Eye, Car, User, CreditCard,
  Loader2, ExternalLink, CheckCircle, AlertTriangle, Image
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import paymentsService from '@/api/services/payments.service';

export default function PaymentApprovals() {
  const queryClient = useQueryClient();
  const [selectedProof, setSelectedProof] = React.useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = React.useState(false);

  // Fetch all payments with proofs
  const { data: paymentsResponse, isLoading } = useQuery({
    queryKey: ['payments-with-proofs'],
    queryFn: () => paymentsService.list({ take: 500 }),
  });

  const payments = paymentsResponse?.data || [];

  // Extract all proofs that need verification
  const pendingProofs = useMemo(() => {
    const proofs = [];
    payments.forEach(payment => {
      const paymentProofs = payment.paymentProofs || payment.payment_proofs || [];
      paymentProofs.forEach(proof => {
        if (!proof.verified) {
          proofs.push({
            ...proof,
            payment,
            vehicle: payment.vehicle || payment.vehicles,
            driver: payment.driver || payment.drivers,
            bank: payment.bank || payment.banks,
          });
        }
      });
    });
    return proofs.sort((a, b) =>
      new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
    );
  }, [payments]);

  // Get verified proofs for stats
  const verifiedProofs = useMemo(() => {
    const proofs = [];
    payments.forEach(payment => {
      const paymentProofs = payment.paymentProofs || payment.payment_proofs || [];
      paymentProofs.forEach(proof => {
        if (proof.verified) {
          proofs.push(proof);
        }
      });
    });
    return proofs;
  }, [payments]);

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: (proofId: string) => paymentsService.verifyProof(proofId),
    onSuccess: () => {
      toast.success('Preuve de paiement verifiee');
      queryClient.invalidateQueries({ queryKey: ['payments-with-proofs'] });
      setShowVerifyDialog(false);
      setSelectedProof(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la verification');
    },
  });

  const handleVerify = (proof) => {
    setSelectedProof(proof);
    setShowVerifyDialog(true);
  };

  const confirmVerify = () => {
    if (selectedProof) {
      verifyMutation.mutate(selectedProof.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validation Paiements"
        subtitle="Verification des preuves de paiement soumises"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">En attente</p>
                <p className="text-3xl font-bold text-amber-700">{pendingProofs.length}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Verifiees</p>
                <p className="text-3xl font-bold text-green-700">{verifiedProofs.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total preuves</p>
                <p className="text-3xl font-bold text-blue-700">
                  {pendingProofs.length + verifiedProofs.length}
                </p>
              </div>
              <FileCheck className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proofs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Preuves en attente de validation ({pendingProofs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProofs.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Aucune preuve en attente</p>
              <p className="text-slate-400 text-sm">Toutes les preuves ont ete verifiees</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProofs.map((proof) => {
                const vehicle = proof.vehicle;
                const driver = proof.driver;
                const payment = proof.payment;
                const dueAmount = payment?.dueAmount || payment?.due_amount || 0;
                const paidAmount = payment?.paidAmount || payment?.paid_amount || 0;

                return (
                  <div
                    key={proof.id}
                    className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Proof Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Image className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {proof.fileName || proof.file_name || 'Document'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {proof.fileType || proof.file_type || 'Fichier'}
                          </p>
                          <p className="text-xs text-slate-400">
                            Soumis le {format(new Date(proof.createdAt || proof.created_at), 'dd/MM/yyyy a HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span>{vehicle?.registrationNumber || vehicle?.registration_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>
                            {driver
                              ? `${driver.first_name || driver.firstName} ${driver.last_name || driver.lastName}`
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-green-600">
                            {paidAmount.toLocaleString('fr-FR')} F
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={proof.fileUrl || proof.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                        </a>
                        <Link href={`/payments/${payment?.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerify(proof)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Valider
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    {proof.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Note:</span> {proof.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Verified */}
      {verifiedProofs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recemment verifiees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {verifiedProofs.slice(0, 5).map((proof) => (
                <div
                  key={proof.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {proof.fileName || proof.file_name || 'Document'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Verifie le {format(new Date(proof.verifiedAt || proof.verified_at), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Verifie</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verify Confirmation Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider cette preuve?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous confirmez que cette preuve de paiement est valide et authentique.
              {selectedProof && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium">{selectedProof.fileName || selectedProof.file_name || 'Document'}</p>
                  {selectedProof.notes && (
                    <p className="text-sm text-slate-500 mt-1">{selectedProof.notes}</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmVerify}
              disabled={verifyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
